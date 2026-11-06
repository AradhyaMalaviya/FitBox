import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Locate FFmpeg in PATH or WinGet installation
let FFMPEG_CMD = 'ffmpeg';
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  const fallback = 'C:\\Users\\deepa\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
  if (fs.existsSync(fallback)) {
    FFMPEG_CMD = fallback;
  }
}

const APP_URL = 'http://127.0.0.1:5173';
const RAW_DIR = path.resolve('artifacts/demo-video-raw');
const OUT_DIR = path.resolve('artifacts/demo-video');
const FINAL_MP4 = path.join(OUT_DIR, 'complete-project-end-to-end-demonstration.mp4');

// Helper to update the floating HUD status pill
async function setHud(page, title, subtitle = '') {
  console.log(`[Demo HUD] ${title} - ${subtitle}`);
  try {
    await page.evaluate(({ title, subtitle }) => {
      let el = document.getElementById('demo-hud');
      if (!el) {
        el = document.createElement('div');
        el.id = 'demo-hud';
        el.style.position = 'fixed';
        el.style.top = '14px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.zIndex = '999999';
        el.style.backgroundColor = 'rgba(15, 23, 42, 0.94)';
        el.style.color = '#38bdf8';
        el.style.padding = '8px 22px';
        el.style.borderRadius = '9999px';
        el.style.fontSize = '13px';
        el.style.fontWeight = '600';
        el.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        el.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 16px rgba(56, 189, 248, 0.35)';
        el.style.border = '1px solid rgba(56, 189, 248, 0.45)';
        el.style.backdropFilter = 'blur(12px)';
        el.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.pointerEvents = 'none';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '8px';
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <span style="font-size: 15px">⚡</span>
        <strong style="color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px;">FitBox Pro Demo</strong>
        <span style="color: #64748b">|</span>
        <span style="color: #f8fafc; font-weight: 500">${title}</span>
        ${subtitle ? `<span style="color: #94a3b8; font-size: 11px">(${subtitle})</span>` : ''}
      `;
    }, { title, subtitle });
  } catch {
    // ignore hud update during fast navigation
  }
}

// Helper to smooth scroll
async function smoothScroll(page, targetY, durationMs = 1000) {
  try {
    await page.evaluate(async ({ targetY, durationMs }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();
      await new Promise((resolve) => {
        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }, { targetY, durationMs });
  } catch {}
  await page.waitForTimeout(300);
}

// Helper to highlight and click elements safely
async function highlightAndClick(page, selectorOrLocator, delayAfter = 700) {
  let locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator).first() : selectorOrLocator;
  try {
    if (await locator.isVisible({ timeout: 2500 })) {
      const box = await locator.boundingBox();
      if (box) {
        const targetX = box.x + box.width / 2;
        const targetY = box.y + box.height / 2;
        await page.mouse.move(targetX, targetY, { steps: 8 });
        await page.waitForTimeout(100);
      }
      await locator.click();
    }
  } catch {
    try {
      await locator.click({ force: true, timeout: 1500 });
    } catch {}
  }
  await page.waitForTimeout(delayAfter);
}

async function runDemonstration() {
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const f of fs.readdirSync(RAW_DIR)) {
    if (f.endsWith('.webm')) fs.unlinkSync(path.join(RAW_DIR, f));
  }

  console.log('Launching Playwright Chromium browser (1280x720 video recording)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  // Inject visual cursor and HUD styling on every page load
  await context.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '22px';
      cursor.style.height = '22px';
      cursor.style.borderRadius = '50%';
      cursor.style.border = '2.5px solid #38bdf8';
      cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.35)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '9999999';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'width 0.15s, height 0.15s, background-color 0.15s, border-color 0.15s';
      cursor.style.display = 'none';
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });
      window.addEventListener('mousedown', () => {
        cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.75)';
        cursor.style.borderColor = '#ef4444';
        cursor.style.width = '28px';
        cursor.style.height = '28px';
      });
      window.addEventListener('mouseup', () => {
        cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.35)';
        cursor.style.borderColor = '#38bdf8';
        cursor.style.width = '22px';
        cursor.style.height = '22px';
      });
    });
  });

  const page = await context.newPage();

  // ══════════════════════════════════════════════════════════════
  // SCENE 1: LANDING PAGE & BRAND SHOWCASE (/)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 1: Landing Page & Public Tour ---');
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await setHud(page, 'Landing Page', 'AI Fitness Coach Built for India');
  await page.waitForTimeout(1400);

  // Smooth scroll down to explore features
  await smoothScroll(page, 550, 1200);
  await setHud(page, 'Features Grid', 'AI Coaching, Indian Nutrition & Smart Workouts');
  await page.waitForTimeout(1400);

  await smoothScroll(page, 1100, 1200);
  await setHud(page, 'Feature Highlights', 'Personalized Macros, GymBuddy Social & Muscle Maps');
  await page.waitForTimeout(1200);

  await smoothScroll(page, 0, 800);
  await page.waitForTimeout(800);

  // Click Get Started Free to navigate to Auth
  await setHud(page, 'Authentication Gateway', 'Sign In, Sign Up, or Guest Access');
  const getStartedBtn = page.locator('a:has-text("Get Started Free")').first();
  await highlightAndClick(page, getStartedBtn, 1000);

  // ══════════════════════════════════════════════════════════════
  // SCENE 2: AUTHENTICATION & PASSWORD RESET (/auth, /reset-password)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 2: Authentication & Password Reset ---');
  await setHud(page, 'Authentication Experience', 'Secure Multi-Mode Auth Gateway');
  await page.waitForTimeout(800);

  // Toggle between Sign In and Sign Up tabs
  const signUpTab = page.locator('button:has-text("Sign Up"), [role="tab"]:has-text("Sign Up")').first();
  if (await signUpTab.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, signUpTab, 600);
  }
  const signInTab = page.locator('button:has-text("Sign In"), [role="tab"]:has-text("Sign In")').first();
  if (await signInTab.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, signInTab, 600);
  }

  // Explore Forgot Password link
  const forgotPwLink = page.locator('a:has-text("Forgot password"), button:has-text("Forgot password")').first();
  if (await forgotPwLink.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Password Recovery', 'Dedicated Password Reset Route');
    await highlightAndClick(page, forgotPwLink, 1000);
    await page.waitForTimeout(800);

    // Return to /auth
    await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
  }

  // Click "Continue as Guest"
  await setHud(page, 'Guest Authentication', 'Entering Instant Session: Alex Rivera');
  const guestBtn = page.locator('button:has-text("Continue as Guest")');
  await highlightAndClick(page, guestBtn, 800);

  // Fill in display name
  const guestNameInput = page.locator('#guest-name');
  if (await guestNameInput.isVisible()) {
    await guestNameInput.fill('Alex Rivera');
    await page.waitForTimeout(600);
  }

  // Submit
  const submitGuest = page.locator('button[type="submit"]:has-text("Continue")');
  await highlightAndClick(page, submitGuest, 1500);

  // Now on Dashboard
  await page.waitForURL('**/dashboard', { timeout: 6000 });
  await setHud(page, 'Dashboard Overview', 'Authenticated Guest Session Active');
  await page.waitForTimeout(1200);

  // ══════════════════════════════════════════════════════════════
  // SCENE 3: 4-STEP PERSONALIZED ONBOARDING WIZARD (/onboarding)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 3: 4-Step Onboarding Wizard ---');
  await setHud(page, 'Onboarding Wizard', 'Step 1: Physique Inspiration & Goals');
  
  // Click Start onboarding CTA
  const startOnboardingBtn = page.locator('a:has-text("Start onboarding")');
  await highlightAndClick(page, startOnboardingBtn, 1200);

  // Step 1: Select preset card
  const presetBtn = page.locator('button:has-text("Lean Athletic"), button:has-text("Classic Bodybuilder"), button:has-text("Athletic")').first();
  if (await presetBtn.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, presetBtn, 800);
  }
  const notesArea = page.locator('textarea');
  if (await notesArea.isVisible({ timeout: 1000 })) {
    await notesArea.fill('Goal: Build defined shoulders, increase pull-up strength, and maintain 12% body fat.');
    await page.waitForTimeout(600);
  }

  // Step 1 -> Next
  const nextBtn = page.locator('button:has-text("Next")');
  await highlightAndClick(page, nextBtn, 1000);

  // Step 2: Diet
  await setHud(page, 'Onboarding Wizard', 'Step 2: Diet Preferences & Caloric Target');
  const vegRadio = page.locator('label:has-text("Vegetarian"), label:has-text("vegetarian")').first();
  if (await vegRadio.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, vegRadio, 800);
  }
  const calTarget = page.locator('input[type="number"]').first();
  if (await calTarget.isVisible({ timeout: 1000 })) {
    await calTarget.fill('2450');
    await page.waitForTimeout(500);
  }
  await highlightAndClick(page, nextBtn, 1000);

  // Step 3: Meals & Allergies
  await setHud(page, 'Onboarding Wizard', 'Step 3: Meal Split & Allergen Filtering');
  const mealRoutineRadio = page.locator('label:has-text("4–5 meals a day"), label:has-text("3 meals a day")').first();
  if (await mealRoutineRadio.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, mealRoutineRadio, 800);
  }
  await highlightAndClick(page, nextBtn, 1000);

  // Step 4: Workout Schedule
  await setHud(page, 'Onboarding Wizard', 'Step 4: Training Window & Preferred Time');
  const morningRadio = page.locator('label:has-text("Morning"), label:has-text("Flexible")').first();
  if (await morningRadio.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, morningRadio, 800);
  }
  await highlightAndClick(page, nextBtn, 1000);

  // Step 5: Summary & Save
  await setHud(page, 'Onboarding Wizard', 'Step 5: Review & Save Preferences');
  await page.waitForTimeout(800);
  const savePrefsBtn = page.locator('button:has-text("Save my preferences")');
  if (await savePrefsBtn.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, savePrefsBtn, 1500);
  }

  // Navigate back to Dashboard
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // ══════════════════════════════════════════════════════════════
  // SCENE 4: GLOBAL HEADER & INTERACTIVE MUSCLE MAP (/dashboard)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 4: Global Header & Interactive Muscle Map ---');
  await setHud(page, 'Dashboard Navigation', 'Header Controls, Notifications & Theme');
  
  // Test theme switch if present
  const themeToggle = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
  if (await themeToggle.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, themeToggle, 800);
    await highlightAndClick(page, themeToggle, 800);
  }

  // Interactive Muscle Map exploration
  await setHud(page, 'Interactive Muscle Map', 'Anatomical Visualization with Equipment Filtering');
  await smoothScroll(page, 200, 700);
  await page.waitForTimeout(800);

  // Toggle View: Front / Back
  const backToggle = page.locator('button:has-text("Back"), [role="tab"]:has-text("Back")').first();
  if (await backToggle.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Muscle Map', 'Posterior (Back) Anatomy View');
    await highlightAndClick(page, backToggle, 1000);
  }

  const frontToggle = page.locator('button:has-text("Front"), [role="tab"]:has-text("Front")').first();
  if (await frontToggle.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Muscle Map', 'Anterior (Front) Anatomy View');
    await highlightAndClick(page, frontToggle, 1000);
  }

  // Click equipment filter chips
  const dumbbellChip = page.locator('button:has-text("Dumbbells"), [role="checkbox"]:has-text("Dumbbells"), div:has-text("Dumbbells")').first();
  if (await dumbbellChip.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Muscle Map', 'Filtering for Dumbbell Exercises');
    await highlightAndClick(page, dumbbellChip, 800);
  }

  const barbellChip = page.locator('button:has-text("Barbell"), [role="checkbox"]:has-text("Barbell"), div:has-text("Barbell")').first();
  if (await barbellChip.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Muscle Map', 'Filtering for Barbell Exercises');
    await highlightAndClick(page, barbellChip, 800);
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 5: EXERCISE DIRECTORY & DETAILED BREAKDOWN (/exercises, /exercise/:id)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 5: Exercise Library & Details ---');
  await setHud(page, 'Exercise Directory', '50+ Exercises with Video Cues & Biomechanics');
  await page.goto(`${APP_URL}/exercises`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Search for an exercise
  const searchInput = page.locator('input[placeholder*="Search exercises"], input[placeholder*="Search by name"]').first();
  if (await searchInput.isVisible({ timeout: 1500 })) {
    await searchInput.fill('Bench Press');
    await page.waitForTimeout(800);
    await searchInput.fill('');
    await page.waitForTimeout(400);
  }

  const chestBadge = page.locator('button:has-text("Chest"), [role="tab"]:has-text("Chest")').first();
  if (await chestBadge.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, chestBadge, 800);
  }

  await smoothScroll(page, 350, 700);
  await page.waitForTimeout(600);

  // Click on the first exercise card to see details/modal
  const firstCard = page.locator('.group, [data-exercise-id], article').first();
  if (await firstCard.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Exercise Details Modal', 'Form Guides, Setup Tips & Primary Muscles');
    await highlightAndClick(page, firstCard, 1200);
  }

  // Close modal if open
  const closeBtn = page.locator('[aria-label="Close"], button:has-text("Close"), svg.lucide-x').first();
  if (await closeBtn.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, closeBtn, 600);
  }

  // Visit dedicated Exercise Detail route
  await setHud(page, 'Dedicated Exercise Detail Page', 'Comprehensive Biomechanics & Technique Analysis');
  await page.goto(`${APP_URL}/exercise/barbell-bench-press`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await smoothScroll(page, 300, 700);
  await page.waitForTimeout(800);

  // ══════════════════════════════════════════════════════════════
  // SCENE 6: LIVE ACTIVE WORKOUT TRACKER (/workout/active)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 6: Live Active Workout Tracker ---');
  await page.goto(`${APP_URL}/workout/active`, { waitUntil: 'networkidle' });
  await setHud(page, 'Active Workout Tracker', 'Live Timer, Set Logging & Real-Time Rest Tracking');
  await page.waitForTimeout(1000);

  // Click Start Empty Workout
  const startEmptyBtn = page.locator('button:has-text("Start Empty Workout"), button:has-text("Start Workout")').first();
  if (await startEmptyBtn.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, startEmptyBtn, 1000);
  }

  // Click + Add Exercise
  const addExBtn = page.locator('button:has-text("Add Exercise"), button:has-text("+ Add")').first();
  if (await addExBtn.isVisible({ timeout: 2000 })) {
    await setHud(page, 'Workout Logging', 'Adding Exercises to Workout Session');
    await highlightAndClick(page, addExBtn, 1000);

    const ex1 = page.locator('button:has-text("Barbell Bench Press"), div:has-text("Barbell Bench Press")').first();
    if (await ex1.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, ex1, 600);
    }
    const ex2 = page.locator('button:has-text("Incline Dumbbell Press"), div:has-text("Incline Dumbbell Press")').first();
    if (await ex2.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, ex2, 600);
    }

    const drawerDoneBtn = page.locator('button:has-text("Done"), button:has-text("Add Selected"), [aria-label="Close"]').first();
    if (await drawerDoneBtn.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, drawerDoneBtn, 800);
    }
  }

  // Log set: Fill weight & reps
  await setHud(page, 'Workout Logging', 'Logging Set 1: 60 kg × 10 Reps');
  const weightInputs = page.locator('input[placeholder="kg"], input[placeholder="Weight"], input[type="number"]');
  if (await weightInputs.count() >= 2) {
    await weightInputs.nth(0).fill('60');
    await page.waitForTimeout(300);
    await weightInputs.nth(1).fill('10');
    await page.waitForTimeout(300);
  }

  // Complete set with checkmark button
  const checkmarkBtn = page.locator('button:has(svg.lucide-check), button:has-text("✓")').first();
  if (await checkmarkBtn.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Set Completed', 'Rest Timer Triggered & Set Status Verified');
    await highlightAndClick(page, checkmarkBtn, 1200);
  }

  // Click Finish Workout
  const finishBtn = page.locator('button:has-text("Finish Workout"), button:has-text("Finish")').first();
  if (await finishBtn.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Workout Complete', 'Persisting Completed Workout Locally');
    await highlightAndClick(page, finishBtn, 800);

    const confirmFinishBtn = page.locator('button:has-text("Finish"), [role="dialog"] button:has-text("Save")').first();
    if (await confirmFinishBtn.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, confirmFinishBtn, 1400);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 7: CUSTOM WORKOUT GENERATOR & SPLIT BUILDER (/generator)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 7: Workout Generator & Split Builder ---');
  await page.goto(`${APP_URL}/generator`, { waitUntil: 'networkidle' });
  await setHud(page, 'Workout Generator', 'Building Custom Split by Muscle & Equipment');
  await page.waitForTimeout(1000);

  const chestGen = page.locator('button:has-text("Chest"), [role="button"]:has-text("Chest")').first();
  if (await chestGen.isVisible({ timeout: 1500 })) await highlightAndClick(page, chestGen, 500);

  const shouldersGen = page.locator('button:has-text("Shoulders"), [role="button"]:has-text("Shoulders")').first();
  if (await shouldersGen.isVisible({ timeout: 1500 })) await highlightAndClick(page, shouldersGen, 500);

  const armsGen = page.locator('button:has-text("Arms"), [role="button"]:has-text("Arms")').first();
  if (await armsGen.isVisible({ timeout: 1500 })) await highlightAndClick(page, armsGen, 500);

  const gymPreset = page.locator('button:has-text("Full Commercial Gym"), label:has-text("Full Commercial Gym")').first();
  if (await gymPreset.isVisible({ timeout: 1500 })) await highlightAndClick(page, gymPreset, 600);

  const genBtn = page.locator('button:has-text("Generate Workout"), button:has-text("Generate Routine"), button:has-text("Generate")').first();
  if (await genBtn.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Workout Generator', 'Synthesizing Volume, Sets & Fatigue Curve');
    await highlightAndClick(page, genBtn, 1400);
  }

  await smoothScroll(page, 450, 800);
  await page.waitForTimeout(1000);

  // ══════════════════════════════════════════════════════════════
  // SCENE 8: FITNESS CALCULATORS & TOOLS HUB (/tools)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 8: Fitness Calculators & Tools ---');
  await page.goto(`${APP_URL}/tools`, { waitUntil: 'networkidle' });
  await setHud(page, 'Calculators Hub', 'Scientific 1RM Strength & Barbell Plate Loader');
  await page.waitForTimeout(1000);

  // Tab 1: 1RM Calculator inputs
  const weightInput1RM = page.locator('input[type="number"]').first();
  if (await weightInput1RM.isVisible({ timeout: 1500 })) {
    await weightInput1RM.fill('100');
    await page.waitForTimeout(400);
  }
  const repsInput1RM = page.locator('input[type="number"]').nth(1);
  if (await repsInput1RM.isVisible({ timeout: 1500 })) {
    await repsInput1RM.fill('5');
    await page.waitForTimeout(600);
  }

  await smoothScroll(page, 300, 700);
  await page.waitForTimeout(800);

  // Tab 2: Calories & TDEE
  const tdeeTab = page.locator('[role="tab"]:has-text("Calories"), button:has-text("Calories")').first();
  if (await tdeeTab.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Calculators Hub', 'Mifflin-St Jeor BMR & Total Daily Energy Expenditure');
    await highlightAndClick(page, tdeeTab, 800);
    await smoothScroll(page, 200, 600);
    await page.waitForTimeout(800);
  }

  // Tab 3: Macros & Meals
  const macrosTab = page.locator('[role="tab"]:has-text("Macros"), button:has-text("Macros")').first();
  if (await macrosTab.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Calculators Hub', 'Target Macronutrient Ratios & Meal Distribution');
    await highlightAndClick(page, macrosTab, 800);
    await smoothScroll(page, 200, 600);
    await page.waitForTimeout(800);
  }

  // Tab 4: Body Fat %
  const bodyfatTab = page.locator('[role="tab"]:has-text("Body Fat"), button:has-text("Body Fat")').first();
  if (await bodyfatTab.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Calculators Hub', 'U.S. Navy Anthropometric Body Fat Formula');
    await highlightAndClick(page, bodyfatTab, 800);
    await page.waitForTimeout(800);
  }

  // Tab 5: Calorie Burn
  const burnTab = page.locator('[role="tab"]:has-text("Burn"), button:has-text("Burn")').first();
  if (await burnTab.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Calculators Hub', 'Metabolic Equivalent (MET) Workout Calorie Burn');
    await highlightAndClick(page, burnTab, 800);
    await page.waitForTimeout(800);
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 9: STRETCHES & MOBILITY LIBRARY (/stretches)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 9: Stretches & Mobility ---');
  await page.goto(`${APP_URL}/stretches`, { waitUntil: 'networkidle' });
  await setHud(page, 'Stretches & Mobility', 'Dynamic Activation & Static Recovery Directory');
  await page.waitForTimeout(1000);

  const legsStretchFilter = page.locator('button:has-text("Legs"), [role="tab"]:has-text("Legs")').first();
  if (await legsStretchFilter.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, legsStretchFilter, 800);
  }

  const stretchCardBtn = page.locator('button:has(svg.lucide-chevron-down), article button, div.cursor-pointer').first();
  if (await stretchCardBtn.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Stretch Technique', 'Step-by-Step Cues, Hold Durations & Breathing Rhythm');
    await highlightAndClick(page, stretchCardBtn, 1000);
  }

  await smoothScroll(page, 250, 600);
  await page.waitForTimeout(800);

  // ══════════════════════════════════════════════════════════════
  // SCENE 10: WORKOUT TEMPLATES & ROUTINES LIBRARY (/workouts, /routines)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 10: Workout & Routine Libraries ---');
  await page.goto(`${APP_URL}/workouts`, { waitUntil: 'networkidle' });
  await setHud(page, 'Workout Library', 'Curated Hypertrophy, Strength & HIIT Protocols');
  await page.waitForTimeout(1000);

  const strengthCat = page.locator('button:has-text("Strength"), [role="tab"]:has-text("Strength")').first();
  if (await strengthCat.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, strengthCat, 800);
  }

  await page.goto(`${APP_URL}/routines`, { waitUntil: 'networkidle' });
  await setHud(page, 'Routine Library', 'Multi-Day Periodized Training Splits');
  await page.waitForTimeout(1000);

  // ══════════════════════════════════════════════════════════════
  // SCENE 11: EDUCATIONAL FITNESS ARTICLES (/articles)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 11: Fitness Articles & Guides ---');
  await page.goto(`${APP_URL}/articles`, { waitUntil: 'networkidle' });
  await setHud(page, 'Evidence-Based Articles', 'Hypertrophy Science, Biomechanics & Recovery');
  await page.waitForTimeout(1000);

  const firstArticle = page.locator('article, a:has(h3), div:has(h3)').first();
  if (await firstArticle.isVisible({ timeout: 1500 })) {
    await setHud(page, 'Article Deep Dive', 'Progressive Overload & Muscle Protein Synthesis');
    await highlightAndClick(page, firstArticle, 1200);
    await smoothScroll(page, 300, 800);
    await page.waitForTimeout(1000);
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 12: NUTRITION ARCHITECTURE & INDIAN FOOD DATABASE
  // (/nutrition, /nutrition/questionnaire, /nutrition/roadmap)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 12: Nutrition Planning & Indian Food Database ---');
  await page.goto(`${APP_URL}/nutrition`, { waitUntil: 'networkidle' });
  await setHud(page, 'Nutrition Hub', 'Overview & Indian Diet Tailoring');
  await page.waitForTimeout(1000);

  // Visit Questionnaire
  await page.goto(`${APP_URL}/nutrition/questionnaire`, { waitUntil: 'networkidle' });
  await setHud(page, 'Nutrition Questionnaire', 'BMR, Activity Multipliers & Dietary Preferences');
  await page.waitForTimeout(1000);

  // Inject complete nutrition preferences to unlock full roadmap
  await page.evaluate(() => {
    localStorage.setItem('nutritionUserData', JSON.stringify({
      gender: 'male',
      age: '26',
      weight: '75',
      height: '178',
      goal: 'lean-bulk',
      dietaryPreference: 'vegetarian',
      activityLevel: 'moderate'
    }));
  });

  await page.goto(`${APP_URL}/nutrition/roadmap`, { waitUntil: 'networkidle' });
  await setHud(page, 'Personalized Nutrition Roadmap', 'Caloric Targets, Macro Distribution & Indian Food Swaps');
  await page.waitForTimeout(1000);
  await smoothScroll(page, 350, 1000);
  await page.waitForTimeout(1400);

  // ══════════════════════════════════════════════════════════════
  // SCENE 13: GYMBUDDY SOCIAL MATCHMAKING NETWORK
  // (/gymbuddy/setup, /gymbuddy/discover, /gymbuddy/matches, /gymbuddy/settings)
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 13: GymBuddy Matchmaking & Social Network ---');
  await page.goto(`${APP_URL}/gymbuddy/setup`, { waitUntil: 'networkidle' });
  await setHud(page, 'GymBuddy Network', 'Profile Configuration for Training Synergy');
  await page.waitForTimeout(1000);

  const nameField = page.locator('input[name="display_name"], input#display_name').first();
  if (await nameField.isVisible({ timeout: 1500 })) await nameField.fill('Alex Rivera');

  const gymField = page.locator('input[name="gym_location"], input#gym_location').first();
  if (await gymField.isVisible({ timeout: 1500 })) await gymField.fill('Gold’s Gym Indiranagar, Bengaluru');

  await page.goto(`${APP_URL}/gymbuddy/discover`, { waitUntil: 'networkidle' });
  await setHud(page, 'GymBuddy Radar & Discovery', '5-Axis Compatibility Scoring Engine');
  await page.waitForTimeout(1400);

  await page.goto(`${APP_URL}/gymbuddy/matches`, { waitUntil: 'networkidle' });
  await setHud(page, 'GymBuddy Matches', 'Active Match Channels & Realtime Messaging');
  await page.waitForTimeout(1200);

  await page.goto(`${APP_URL}/gymbuddy/settings`, { waitUntil: 'networkidle' });
  await setHud(page, 'GymBuddy Settings', 'Proximity Radius & Discovery Preferences');
  await page.waitForTimeout(1000);

  // ══════════════════════════════════════════════════════════════
  // SCENE 14: DUAL AI AGENTS DEMONSTRATION
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 14: Dual AI Agents Interaction ---');
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. FitnessChat (Bottom-Right AI Coach)
  await setHud(page, 'AI Fitness Coach', 'Interactive Biomechanics & Indian Nutrition Consultation');
  const fitnessChatToggle = page.locator('button.fixed.bottom-20.right-4, button.fixed.bottom-6.right-6, button:has(svg.lucide-sparkles)').last();
  if (await fitnessChatToggle.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, fitnessChatToggle, 1000);

    const localTab = page.locator('button:has-text("Local NLP"), [role="tab"]:has-text("Local")').first();
    if (await localTab.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, localTab, 600);
      const nlpInput = page.locator('input[placeholder*="Local NLP"]').first();
      if (await nlpInput.isVisible({ timeout: 1000 })) {
        await nlpInput.fill('chest exercises and warm up');
        await page.waitForTimeout(500);
        const sendBtn = page.locator('button[type="submit"]:has(svg.lucide-send)').last();
        if (await sendBtn.isVisible({ timeout: 1000 })) {
          await highlightAndClick(page, sendBtn, 1400);
        }
      }
    } else {
      const chip = page.locator('button:has-text("Protein Swap"), button:has-text("Form Tip")').first();
      if (await chip.isVisible({ timeout: 1500 })) {
        await highlightAndClick(page, chip, 1600);
      }
    }
    await page.waitForTimeout(1000);

    const closeFitnessChat = page.locator('button:has(svg.lucide-x)').last();
    if (await closeFitnessChat.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, closeFitnessChat, 600);
    }
  }

  // 2. ProjectAssistantChat (Bottom-Left Architectural Copilot)
  await setHud(page, 'Project Assistant Copilot', 'Architectural Guidance & Codebase Introspection');
  const projectAssistantToggle = page.locator('button[aria-label="Open project assistant"]').first();
  if (await projectAssistantToggle.isVisible({ timeout: 2000 })) {
    await highlightAndClick(page, projectAssistantToggle, 1000);
    await page.waitForTimeout(1000);

    const projectInput = page.locator('input[placeholder*="Ask about the codebase"]').first();
    if (await projectInput.isVisible({ timeout: 1000 })) {
      await projectInput.fill('Where is the 100-point compatibility score matrix implemented?');
      await page.waitForTimeout(600);
      const sendProjBtn = page.locator('button:has(svg.lucide-send)').first();
      if (await sendProjBtn.isVisible({ timeout: 1000 })) {
        await highlightAndClick(page, sendProjBtn, 1400);
      }
    }

    const closeProjectChat = page.locator('button:has(svg.lucide-x)').first();
    if (await closeProjectChat.isVisible({ timeout: 1500 })) {
      await highlightAndClick(page, closeProjectChat, 600);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 15: 404 RESILIENCE & ERROR HANDLING
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 15: 404 Resilience & Error Handling ---');
  await setHud(page, 'Error Boundaries & 404 Handling', 'Graceful Recovery for Nonexistent Routes');
  await page.goto(`${APP_URL}/explore-nonexistent-path`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Return to Dashboard
  const backHomeBtn = page.locator('a:has-text("Return to Home"), a:has-text("Dashboard"), button:has-text("Go Home")').first();
  if (await backHomeBtn.isVisible({ timeout: 1500 })) {
    await highlightAndClick(page, backHomeBtn, 1000);
  } else {
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle' });
  }

  // ══════════════════════════════════════════════════════════════
  // SCENE 16: GRAND FINALE ON DASHBOARD
  // ══════════════════════════════════════════════════════════════
  console.log('\n--- SCENE 16: Grand Finale ---');
  await setHud(page, 'FitBox Complete Demonstration', 'Full System Verified & Operable');
  await smoothScroll(page, 0, 700);
  await page.waitForTimeout(2000);

  console.log('Finalizing recording and flushing video stream...');
  await page.close();
  await context.close();
  await browser.close();

  const webmFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.webm'));
  if (webmFiles.length === 0) {
    throw new Error('No .webm video was generated by Playwright.');
  }

  const rawVideoPath = path.join(RAW_DIR, webmFiles[0]);
  console.log(`Raw video captured: ${rawVideoPath} (${fs.statSync(rawVideoPath).size} bytes)`);

  console.log(`Encoding final MP4 to: ${FINAL_MP4}...`);
  execSync(`"${FFMPEG_CMD}" -y -i "${rawVideoPath}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${FINAL_MP4}"`, {
    stdio: 'inherit',
  });

  const finalStat = fs.statSync(FINAL_MP4);
  console.log(`\n🎉 SUCCESS! Complete demonstration MP4 created:`);
  console.log(`Path: ${FINAL_MP4}`);
  console.log(`Size: ${(finalStat.size / (1024 * 1024)).toFixed(2)} MB`);
}

runDemonstration().catch(err => {
  console.error('Fatal demonstration error:', err);
  process.exit(1);
});
