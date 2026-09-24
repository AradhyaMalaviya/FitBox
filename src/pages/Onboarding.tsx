import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  INSPIRATION_PRESETS,
  COMMON_ALLERGENS,
  InspirationPresetName,
  parseAllergies,
  deriveInspirationScore,
  onboardingSchema,
  type UserPreferencePayload,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

interface InspirationImage {
  id: string;
  src: string;
  file?: File;
}

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  // ---- Step 1: Inspiration ----
  const [inspirationImages, setInspirationImages] = useState<InspirationImage[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<InspirationPresetName | null>(null);
  const [inspirationNotes, setInspirationNotes] = useState("");
  const [inspirationError, setInspirationError] = useState<string | null>(null);

  // ---- Step 2: Diet ----
  const [dietType, setDietType] = useState<
    "omnivore" | "vegetarian" | "vegan" | "eggetarian" | "pescatarian" | ""
  >("");
  const [calorieTarget, setCalorieTarget] = useState<string>("");
  const [dietError, setDietError] = useState<string | null>(null);

  // ---- Step 3: Meals & Allergies ----
  const [mealRoutine, setMealRoutine] = useState<"3" | "4-5" | "intermittent-fasting" | "">("");
  const [eatingWindowStart, setEatingWindowStart] = useState<string>("12:00");
  const [eatingWindowEnd, setEatingWindowEnd] = useState<string>("20:00");
  const [allergiesRaw, setAllergiesRaw] = useState<string>("");
  const [avoidAllergens, setAvoidAllergens] = useState<boolean>(true);
  const [mealsError, setMealsError] = useState<string | null>(null);

  // ---- Step 4: Workout Time ----
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<
    "morning" | "afternoon" | "evening" | "flexible" | ""
  >("");
  const [workoutTimeStart, setWorkoutTimeStart] = useState<string>("06:00");
  const [workoutTimeEnd, setWorkoutTimeEnd] = useState<string>("08:00");
  const [workoutError, setWorkoutError] = useState<string | null>(null);

  // ---- Submission state ----
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Derived values
  const parsedAllergies = useMemo(() => parseAllergies(allergiesRaw), [allergiesRaw]);

  const inspirationTags = useMemo(() => {
    const preset = INSPIRATION_PRESETS.find((p) => p.name === selectedPreset);
    return preset ? preset.tags : [];
  }, [selectedPreset]);

  const inspirationScore = useMemo(
    () => deriveInspirationScore(inspirationTags),
    [inspirationTags]
  );

  // ---- Handlers ----

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: InspirationImage[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_UPLOAD_SIZE) {
        setInspirationError("Each image must be under 5MB.");
        continue;
      }

      const base64 = await fileToBase64(file);
      newImages.push({
        id: `${file.name}-${file.size}-${Date.now()}`,
        src: base64,
        file,
      });
    }

    setInspirationError(null);
    setInspirationImages((prev) => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, 2); // only keep first 2
    });

    // Reset input value to allow re-upload of same file if desired
    event.target.value = "";
  };

  const handleSwapImages = () => {
    if (inspirationImages.length === 2) {
      setInspirationImages([inspirationImages[1], inspirationImages[0]]);
    }
  };

  const handleSelectPreset = (name: InspirationPresetName) => {
    setSelectedPreset((prev) => (prev === name ? null : name));
  };

  const goNext = () => {
    if (step === 1) {
      if (inspirationImages.length < 1 && !selectedPreset) {
        setInspirationError("Please upload at least one image or choose a preset.");
        return;
      }
      setInspirationError(null);
    }

    if (step === 2) {
      if (!dietType) {
        setDietError("Please choose a dietary preference.");
        return;
      }
      setDietError(null);
    }

    if (step === 3) {
      if (!mealRoutine) {
        setMealsError("Please select a meal routine.");
        return;
      }
      setMealsError(null);
    }

    if (step === 4) {
      if (!preferredWorkoutTime) {
        setWorkoutError("Please choose when you prefer to train.");
        return;
      }
      setWorkoutError(null);
    }

    setStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const userId = user?.id ?? "guest";

      const uploadedImageUrls: string[] = [];
      const uploadErrors: string[] = [];
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

      for (const img of inspirationImages) {
        if (img.file && user && !user.isGuest) {
          // Validate file type before attempting upload
          if (!ALLOWED_MIME_TYPES.includes(img.file.type)) {
            uploadErrors.push(`"${img.file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`);
            continue;
          }
          if (img.file.size > MAX_UPLOAD_SIZE) {
            uploadErrors.push(`"${img.file.name}" exceeds the 5MB limit.`);
            continue;
          }

          // Use user-scoped path with sanitized filename
          const safeName = img.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileName = `onboarding/${user.authUserId}/${Date.now()}-${safeName}`;
          
          // Try user-media bucket first, fallback to exercise-media
          let targetBucket = 'user-media';
          let uploadResult = await supabase.storage
            .from(targetBucket)
            .upload(fileName, img.file, { contentType: img.file.type, upsert: true });

          if (uploadResult.error) {
            targetBucket = 'exercise-media';
            uploadResult = await supabase.storage
              .from(targetBucket)
              .upload(fileName, img.file, { contentType: img.file.type, upsert: true });
          }
          
          if (!uploadResult.error && uploadResult.data) {
            const { data: urlData } = supabase.storage
              .from(targetBucket)
              .getPublicUrl(uploadResult.data.path);
            uploadedImageUrls.push(urlData.publicUrl);
          } else {
            // Provide actionable feedback instead of silently swallowing
            const reason = uploadResult.error?.message || 'Unknown error';
            uploadErrors.push(`Failed to upload "${img.file.name}": ${reason}`);
            console.warn('Image upload failed:', reason);
          }
        } else {
          // Guest users or no file: keep base64 for localStorage only, don't persist to DB
          uploadedImageUrls.push(img.src);
        }
      }

      // Warn user about upload failures but allow them to continue
      if (uploadErrors.length > 0 && uploadedImageUrls.length === 0 && !selectedPreset) {
        // Only block if there are NO images at all and no preset fallback
        throw new Error(`Image upload failed: ${uploadErrors[0]}. Choose a preset or try again.`);
      }

      const presetItem = INSPIRATION_PRESETS.find((p) => p.name === selectedPreset);
      const fallbackPresetImage = INSPIRATION_PRESETS[0].imageUrl;
      const finalImages = uploadedImageUrls.length > 0 
        ? uploadedImageUrls 
        : (presetItem?.imageUrl ? [presetItem.imageUrl] : [fallbackPresetImage]);

      const payload: UserPreferencePayload = {
        userId,
        inspiration: {
          images: finalImages,
          preset: selectedPreset ?? null,
          tags: inspirationTags,
          notes: inspirationNotes.trim(),
        },
        diet: {
          type: dietType as UserPreferencePayload["diet"]["type"],
          calorieTarget: calorieTarget ? Number(calorieTarget) || null : null,
        },
        meals: {
          routine: mealRoutine as UserPreferencePayload["meals"]["routine"],
          eatingWindow:
            mealRoutine === "intermittent-fasting"
              ? { start: eatingWindowStart, end: eatingWindowEnd }
              : null,
          allergies: parsedAllergies,
          avoidAllergens: parsedAllergies.length > 0 ? avoidAllergens : false,
        },
        workout: {
          preferredTime: preferredWorkoutTime as UserPreferencePayload["workout"]["preferredTime"],
          timeRange:
            preferredWorkoutTime === "flexible"
              ? null
              : {
                  start: workoutTimeStart,
                  end: workoutTimeEnd,
                },
        },
        createdAt: now,
      };

      const validation = onboardingSchema.safeParse(payload);
      if (!validation.success) {
        throw new Error(validation.error.errors[0]?.message || "Invalid onboarding preferences");
      }

      // Always keep a local copy so the wizard result survives even if the
      // user is a guest or the network write fails.
      try {
        localStorage.setItem("fitbox:onboarding", JSON.stringify(payload));
      } catch (storageErr) {
        console.warn("Could not persist preferences to localStorage:", storageErr);
      }

      if (user && !user.isGuest) {
        // Logged-in user: persist to the profile row.
        // `preferences` is typed as `Json` (a recursive union) in Database, but our
        // `UserPreferencePayload` is a plain interface with named keys. JSON-wise
        // the payload is valid; cast at the boundary so the typed client accepts it.
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ preferences: payload as unknown as Database["public"]["Tables"]["profiles"]["Update"]["preferences"] })
          .eq("auth_user_id", user.authUserId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      setSubmitSuccess(
        "Nice. Plan saved. Time to actually lift something heavier than your phone. 🏋️‍♂️"
      );
      setTimeout(() => navigate('/dashboard'), 2000);
      console.log("Onboarding saved", payload, { inspirationScore });
    } catch (error) {
      console.error(error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong saving your preferences."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Render helpers ----

  const renderStepIndicator = () => {
    const steps: { id: Step; label: string }[] = [
      { id: 1, label: "Inspiration" },
      { id: 2, label: "Diet" },
      { id: 3, label: "Meals & Allergies" },
      { id: 4, label: "Workout Time" },
      { id: 5, label: "Summary" },
    ];

    return (
      <ol className="flex flex-wrap gap-3 md:gap-6 justify-center mb-8 text-sm md:text-base">
        {steps.map((s, index) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border text-xs font-semibold",
                  isActive && "bg-primary text-primary-foreground border-primary",
                  isCompleted && "bg-emerald-500 text-white border-emerald-500",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground border-border"
                )}
              >
                {s.id}
              </div>
              <span
                className={cn(
                  "hidden sm:inline",
                  isActive && "text-foreground font-medium",
                  !isActive && "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <span className="hidden md:inline text-muted-foreground">—</span>
              )}
            </li>
          );
        })}
      </ol>
    );
  };

  const renderInspirationStep = () => {
    const eggAllergyConflict =
      dietType === "eggetarian" &&
      parsedAllergies.some((a) => a.toLowerCase().includes("egg") || a.toLowerCase().includes("eggs"));

    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">What inspires your ideal physique?</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Upload up to two photos or pick a preset hero. This helps us understand your target look.
          </p>

          <Label className="text-xs font-medium text-muted-foreground mb-1 block">
            Upload inspiration images (max 2, &lt; 5MB each)
          </Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="mb-3"
          />

          {inspirationImages.length > 0 && (
            <div className="flex gap-3 mb-3">
              {inspirationImages.map((img, index) => (
                <div key={img.id} className="relative w-28 h-28 rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={img.src}
                    alt={`Inspiration ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {inspirationImages.length === 2 && (
            <Button type="button" variant="outline" size="sm" onClick={handleSwapImages} className="text-xs mb-4">
              Swap image order
            </Button>
          )}

          <Label className="text-xs font-medium text-muted-foreground mb-1 block">
            What specifically about this physique do you like?
          </Label>
          <Textarea
            value={inspirationNotes}
            onChange={(e) =>
              setInspirationNotes(e.target.value.slice(0, 120))
            }
            placeholder="e.g., broader shoulders, smaller waist, athletic look (max 120 chars)"
            className="min-h-[80px]"
          />
          <div className="mt-1 text-xs text-muted-foreground text-right">
            {inspirationNotes.length}/120
          </div>

          {inspirationError && (
            <p className="mt-3 text-sm text-destructive">{inspirationError}</p>
          )}

          {eggAllergyConflict && (
            <p className="mt-3 text-xs text-amber-500">
              You selected eggs as an allergen but also eggetarian — confirm this is intentional.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Or pick an inspiration preset</h3>
          <p className="text-xs text-muted-foreground mb-3">
            These give us instant context. You can still upload your own photos above.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {INSPIRATION_PRESETS.map((preset) => {
              const active = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.name)}
                  className={cn(
                    "flex flex-col items-stretch text-left rounded-lg border overflow-hidden bg-card hover:bg-card/80 transition-all",
                    active && "border-primary ring-2 ring-primary/40"
                  )}
                >
                  <div className="h-24 w-full overflow-hidden">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold">{preset.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                      {preset.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Inspiration tags:{" "}
            {inspirationTags.length > 0 ? (
              <span className="inline-flex flex-wrap gap-1">
                {inspirationTags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </span>
            ) : (
              <span>Choose a preset to auto-generate training focus.</span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Inspiration score (for recommendations):{" "}
            <span className="font-medium">{inspirationScore}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDietStep = () => {
    const dietMicrocopy: Record<string, string> = {
      omnivore: "Eats both plants and animal products.",
      vegetarian: "No meat, may include dairy.",
      vegan: "Plants only. No animal products.",
      eggetarian: "Eggs OK. No other meat. Perfect for omelette lovers.",
      pescatarian: "Fish OK. No other land meat.",
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">How do you like to eat?</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;ll tailor your plan around your dietary preference, not against it.
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium mb-2">Dietary preference</Label>
          <RadioGroup
            value={dietType}
            onValueChange={(val) =>
              setDietType(
                val as "omnivore" | "vegetarian" | "vegan" | "eggetarian" | "pescatarian"
              )
            }
            className="grid gap-3 md:grid-cols-2"
          >
            {["omnivore", "vegetarian", "vegan", "eggetarian", "pescatarian"].map((opt) => (
              <Label
                key={opt}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/60",
                  dietType === opt && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value={opt} />
                <div>
                  <div className="text-sm capitalize">{opt}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {dietMicrocopy[opt]}
                    {opt === "eggetarian" && (
                      <span className="ml-1 text-xs text-primary">
                        (Eggetarian = eggs allowed, no other animal meat.)
                      </span>
                    )}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
          {dietError && <p className="mt-2 text-sm text-destructive">{dietError}</p>}
        </div>

        <div className="max-w-xs">
          <Label className="block text-sm font-medium mb-1">
            Typical daily calorie target (optional)
          </Label>
          <Input
            type="number"
            min={1000}
            max={6000}
            placeholder="2500"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value.slice(0, 6))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Rough estimate is fine. We&apos;ll fine-tune later.
          </p>
        </div>
      </div>
    );
  };

  const renderMealsStep = () => {
    const hasAllergies = parsedAllergies.length > 0;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Meals & allergies</h2>
          <p className="text-muted-foreground text-sm">
            Tell us how you like to structure your day and what we should avoid.
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium mb-2">Meal routine</Label>
          <RadioGroup
            value={mealRoutine}
            onValueChange={(val) =>
              setMealRoutine(val as "3" | "4-5" | "intermittent-fasting")
            }
            className="grid gap-3 md:grid-cols-3"
          >
            <Label
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/60",
                mealRoutine === "3" && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem value="3" />
              <div>
                <div className="text-sm">3 meals a day</div>
                <div className="text-[11px] text-muted-foreground">
                  Classic breakfast, lunch, dinner.
                </div>
              </div>
            </Label>

            <Label
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/60",
                mealRoutine === "4-5" && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem value="4-5" />
              <div>
                <div className="text-sm">4–5 meals a day</div>
                <div className="text-[11px] text-muted-foreground">
                  Smaller, more frequent meals.
                </div>
              </div>
            </Label>

            <Label
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/60",
                mealRoutine === "intermittent-fasting" && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem value="intermittent-fasting" />
              <div>
                <div className="text-sm">Intermittent fasting</div>
                <div className="text-[11px] text-muted-foreground">
                  Compressed eating window (e.g., 12:00–20:00).
                </div>
              </div>
            </Label>
          </RadioGroup>
          {mealsError && <p className="mt-2 text-sm text-destructive">{mealsError}</p>}
        </div>

        {mealRoutine === "intermittent-fasting" && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label className="block text-sm font-medium mb-1">Eating window start</Label>
              <Input
                type="time"
                value={eatingWindowStart}
                onChange={(e) => setEatingWindowStart(e.target.value)}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Eating window end</Label>
              <Input
                type="time"
                value={eatingWindowEnd}
                onChange={(e) => setEatingWindowEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <Label className="block text-sm font-medium mb-1">
            Allergies (comma-separated or list)
          </Label>
          <Input
            placeholder="e.g., peanuts, shellfish"
            value={allergiesRaw}
            onChange={(e) => setAllergiesRaw(e.target.value.slice(0, 256))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We&apos;ll validate against common allergens, but you can also add custom ones.
          </p>

          {hasAllergies && (
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground mr-1">Parsed as:</span>
              {parsedAllergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] mr-1 mb-1"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-start gap-2">
            <Checkbox
              id="avoidAllergens"
              checked={hasAllergies ? avoidAllergens : false}
              onCheckedChange={(checked) =>
                setAvoidAllergens(Boolean(checked))
              }
              disabled={!hasAllergies}
            />
            <Label htmlFor="avoidAllergens" className="text-sm">
              I want the plan to avoid my allergens
            </Label>
          </div>

          <div className="mt-3 text-[11px] text-muted-foreground">
            Common allergens we look for: {COMMON_ALLERGENS.join(", ")}.
          </div>
        </div>
      </div>
    );
  };

  const renderWorkoutStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">When do you prefer to train?</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;ll match workouts to your energy curve, not fight against it.
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium mb-2">Preferred workout time</Label>
          <RadioGroup
            value={preferredWorkoutTime}
            onValueChange={(val) =>
              setPreferredWorkoutTime(
                val as "morning" | "afternoon" | "evening" | "flexible"
              )
            }
            className="grid gap-3 md:grid-cols-4"
          >
            {["morning", "afternoon", "evening", "flexible"].map((opt) => (
              <Label
                key={opt}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/60",
                  preferredWorkoutTime === opt && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value={opt} />
                <div>
                  <div className="text-sm capitalize">{opt}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {opt === "morning" && "Fresh start while the world is quiet."}
                    {opt === "afternoon" && "Mid-day energy booster."}
                    {opt === "evening" && "De-stress after work or school."}
                    {opt === "flexible" && "We&apos;ll assume your schedule changes often."}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
          {workoutError && <p className="mt-2 text-sm text-destructive">{workoutError}</p>}
        </div>

        {preferredWorkoutTime !== "" && preferredWorkoutTime !== "flexible" && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label className="block text-sm font-medium mb-1">
                Preferred time range (optional)
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={workoutTimeStart}
                  onChange={(e) => setWorkoutTimeStart(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={workoutTimeEnd}
                  onChange={(e) => setWorkoutTimeEnd(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Helps us place your hardest lifts when you&apos;re most awake.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSummaryStep = () => {
    const primaryImage =
      inspirationImages[0]?.src ||
      INSPIRATION_PRESETS.find((p) => p.name === selectedPreset)?.imageUrl;

    const dietLabel = dietType ? dietType.charAt(0).toUpperCase() + dietType.slice(1) : "";

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Summary</h2>
          <p className="text-muted-foreground text-sm">
            Quick recap before we lock in your plan preferences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="rounded-xl border bg-card overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt="Inspiration preview"
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 flex items-center justify-center text-muted-foreground text-sm">
                  No inspiration image selected
                </div>
              )}
              <div className="p-3 space-y-1 text-xs">
                <div className="font-semibold">Inspiration</div>
                {selectedPreset && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] mr-1">
                    Preset: {selectedPreset}
                  </div>
                )}
                {inspirationTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inspirationTags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-muted text-[11px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {inspirationNotes && (
                  <p className="mt-2 text-muted-foreground line-clamp-3">
                    “{inspirationNotes.trim()}”
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {dietType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  Diet: {dietLabel}
                </span>
              )}
              {mealRoutine && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-xs">
                  Meals:{" "}
                  {mealRoutine === "3"
                    ? "3 meals/day"
                    : mealRoutine === "4-5"
                    ? "4–5 meals/day"
                    : "Intermittent fasting"}
                </span>
              )}
              {preferredWorkoutTime && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs capitalize">
                  Workout: {preferredWorkoutTime}
                </span>
              )}
              {parsedAllergies.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                  Allergies: {parsedAllergies.join(", ")}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm">Details</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {calorieTarget && (
                  <li>Calorie target: ~{calorieTarget} kcal/day</li>
                )}
                {mealRoutine === "intermittent-fasting" && (
                  <li>
                    Eating window: {eatingWindowStart}–{eatingWindowEnd}
                  </li>
                )}
                {preferredWorkoutTime !== "flexible" && (
                  <li>
                    Preferred training time: {workoutTimeStart}–{workoutTimeEnd}
                  </li>
                )}
                {parsedAllergies.length > 0 && (
                  <li>
                    Plan will {avoidAllergens ? "" : "not "}avoid allergens by default.
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground">
              We&apos;ll use this plus your inspiration score (
              <span className="font-medium">{inspirationScore}</span>) to generate
              personalized diet and workout suggestions.
            </div>
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        {submitSuccess && <p className="text-sm text-emerald-500">{submitSuccess}</p>}

        <div className="flex flex-wrap items-center gap-3 justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // simple "surprise me": randomize meal routine if not set
              if (!mealRoutine) {
                const options: ("3" | "4-5" | "intermittent-fasting")[] = [
                  "3",
                  "4-5",
                  "intermittent-fasting",
                ];
                setMealRoutine(options[Math.floor(Math.random() * options.length)]);
              }
              setSubmitSuccess("Surprise settings tweaked. Now hit save to lock it in.");
            }}
          >
            Surprise me
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save my preferences"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-card/40 border border-border rounded-2xl shadow-sm p-6 md:p-8">
          {renderStepIndicator()}

          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 5) {
                goNext();
              } else {
                handleSubmit();
              }
            }}
          >
            {step === 1 && renderInspirationStep()}
            {step === 2 && renderDietStep()}
            {step === 3 && renderMealsStep()}
            {step === 4 && renderWorkoutStep()}
            {step === 5 && renderSummaryStep()}

            <div className="flex justify-between pt-4 border-t border-border/60 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={step === 1}
              >
                Back
              </Button>
              {step < 5 && (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;

// ---- Helpers ----

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

