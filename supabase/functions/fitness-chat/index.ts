// @ts-expect-error - Deno globals are not configured in the host Vite project's tsconfig
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TURNS = 20;
const MAX_REQUEST_SIZE = 50 * 1024; // 50KB

// Rate limiting configuration: 15 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60000;
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

// Cleanup expired rate limit records periodically
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
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please slow down and try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_REQUEST_SIZE) {
      return new Response(JSON.stringify({ error: "Request payload too large (max 50KB)." }), {
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

    const { messages, exerciseData } = parsedBody;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const boundedMessages = messages.slice(-MAX_TURNS);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please check server settings." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Truncate exercise data if too long to avoid token limits
    const truncatedExerciseData = exerciseData && typeof exerciseData === 'string' && exerciseData.length > 3000
      ? exerciseData.substring(0, 3000) + "..."
      : (typeof exerciseData === 'string' ? exerciseData : "");

    // Build a comprehensive system prompt with the actual exercise data
    const systemPrompt = `You are an enthusiastic fitness coach for the FitBox app. Help users plan their workouts based on what they feel like doing. Be encouraging, specific, and suggest exercises from the app's library.

IMPORTANT: You have access to the ACTUAL exercises available in the FitBox app. Only recommend exercises from this list. Here are all available exercises organized by muscle group and difficulty:

${truncatedExerciseData || "Exercise data not provided - give general fitness advice."}

GUIDELINES:
1. When users mention body parts or muscle groups, suggest SPECIFIC exercises from the list above that match their experience level.
2. For beginners, focus on Beginner-level exercises. For more experienced users, suggest Intermediate or Advanced exercises.
3. Provide helpful tips about form, sets, and reps.
4. Keep responses concise and actionable.
5. Be motivating and supportive!
6. If asked about exercises not in the list, let them know what similar exercises ARE available in the app.
7. Do NOT make up exercises or provide links to external resources - stick to recommending exercises from the FitBox library.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...boundedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "AI service authentication failed. Please check API key." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `AI gateway error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const e = error as Error;
    console.error("chat error:", e.message, e.stack);

    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please try again.",
        error_code: "CHAT_ERROR",
        details: e.message
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
    );
  }
});
