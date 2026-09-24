// @ts-expect-error - Deno globals are not configured in the host Vite project's tsconfig
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.5-flash-lite";
const MAX_CONTEXT_CHARS = 12000;
const MAX_TURNS = 20;
const MAX_REQUEST_SIZE = 50 * 1024; // 50KB

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Cleanup function to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, 60000);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_REQUEST_SIZE) {
      return new Response(JSON.stringify({ error: "Request payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, projectContext } = parsedBody;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Set GEMINI_API_KEY in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (messages.length > 100) {
      return new Response(JSON.stringify({ error: "Too many messages in history" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = typeof projectContext === "string" && projectContext.length > MAX_CONTEXT_CHARS
      ? projectContext.slice(0, MAX_CONTEXT_CHARS) + "\n?(project context truncated)"
      : (projectContext ?? "(no project context provided)");

    const systemText = `You are the FitBox project assistant. Answer questions about THIS codebase: where files live, how routes/auth/Supabase/edge functions work, and how to extend the app. Use the PROJECT CONTEXT below as ground truth. Be concise and cite file paths like src/App.tsx. If the answer is not in the context, say so and suggest where to look. Never invent secrets, keys, or env values. Never reveal .env contents or service-role keys.\n\nPROJECT CONTEXT:\n${context}`;

    // Keep the prompt small: last N turns, drop old system messages from client.
    const turns: ChatMessage[] = messages
      .filter((m: ChatMessage) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_TURNS);

    // Gemini requires the first turn to be from the user
    while (turns.length > 0 && turns[0].role !== "user") {
      turns.shift();
    }

    if (turns.length === 0) {
      return new Response(JSON.stringify({ error: "A user message is required to start the conversation." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contents = turns.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, 4000) }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", response.status, errorText.slice(0, 500));
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 400) {
        let errorMessage = "Bad request to AI model. Please check your message.";
        try {
          const errData = JSON.parse(errorText);
          if (errData.error?.message) {
            errorMessage = `AI model error: ${errData.error.message}`;
          }
        } catch {
          // ignore JSON parsing errors and use default message
        }
        return new Response(JSON.stringify({ error: errorMessage }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI model error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts.map((p: { text?: string }) => p.text ?? "").join("").trim()
      : "";

    if (!reply) {
      const blockReason = data?.promptFeedback?.blockReason ?? data?.candidates?.[0]?.finishReason ?? "empty";
      console.error("Gemini empty reply:", blockReason);
      return new Response(JSON.stringify({ error: "AI returned an empty response. Try rephrasing." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const e = error as Error;
    console.error("project-assistant error:", e.message);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
