/**
 * Centralized muscle mapping configuration
 * Maps diagram muscle IDs to exercise muscle groups with rich anatomical metadata
 */
import { exercises, type Exercise } from "@/data/exercises";

export interface MuscleMapping {
  diagramId: string; // ID used in the diagram (e.g., "chest", "biceps")
  exerciseGroup: string; // Muscle group in exercises data (e.g., "Chest", "Arms")
  displayName: string; // Human-readable name
  latinName?: string; // Scientific anatomical name
  category?: "Push" | "Pull" | "Legs" | "Core";
  view?: "front" | "back" | "both";
  functionDescription?: string;
  synergists?: string[];
  antagonists?: string[];
  searchKeywords?: string[];
}

export const MUSCLE_MAPPINGS: Record<string, MuscleMapping> = {
  // ─── CHEST / PECTORALS ──────────────────────────────
  chest: {
    diagramId: "chest",
    exerciseGroup: "Chest",
    displayName: "Chest (Pectorals)",
    latinName: "Pectoralis Major & Minor",
    category: "Push",
    view: "front",
    functionDescription: "Pulls arms forward and across the chest (horizontal adduction), pushing movements, and shoulder flexion.",
    synergists: ["Anterior Deltoids", "Triceps Brachii"],
    antagonists: ["Latissimus Dorsi", "Rhomboids"],
    searchKeywords: ["chest", "pecs", "bench", "press", "fly", "pushup"],
  },
  chest_upper: {
    diagramId: "chest_upper",
    exerciseGroup: "Chest",
    displayName: "Upper Chest (Clavicular)",
    latinName: "Pectoralis Major Clavicular Head",
    category: "Push",
    view: "front",
    functionDescription: "Elevates arms forward and inward; crucial for upper chest fullness and pushing overhead angles.",
    synergists: ["Anterior Deltoids", "Triceps Brachii"],
    antagonists: ["Latissimus Dorsi"],
    searchKeywords: ["incline", "upper chest", "clavicular"],
  },
  chest_lower: {
    diagramId: "chest_lower",
    exerciseGroup: "Chest",
    displayName: "Lower Chest (Sternocostal)",
    latinName: "Pectoralis Major Sternocostal Head",
    category: "Push",
    view: "front",
    functionDescription: "Drives decline pressing and dips, providing lower pectoral sweep and chest thickness.",
    synergists: ["Triceps Brachii", "Anterior Deltoids"],
    antagonists: ["Latissimus Dorsi"],
    searchKeywords: ["decline", "dips", "lower chest", "pec fly"],
  },

  // ─── SHOULDERS / DELTOIDS ───────────────────────────
  shoulders: {
    diagramId: "shoulders",
    exerciseGroup: "Shoulders",
    displayName: "Shoulders (Deltoids)",
    latinName: "Deltoideus",
    category: "Push",
    view: "both",
    functionDescription: "Lifts and rotates arms in 3 dimensions; overhead pushing and shoulder stabilization.",
    synergists: ["Triceps Brachii", "Upper Trapezius", "Serratus Anterior"],
    antagonists: ["Latissimus Dorsi"],
    searchKeywords: ["delts", "overhead", "press", "raises", "shoulders"],
  },
  shoulders_front: {
    diagramId: "shoulders_front",
    exerciseGroup: "Shoulders",
    displayName: "Front Deltoids (Anterior)",
    latinName: "Anterior Deltoid",
    category: "Push",
    view: "front",
    functionDescription: "Flexes the shoulder joint; active in all forward pressing and front raise movements.",
    synergists: ["Upper Chest", "Triceps Brachii"],
    antagonists: ["Latissimus Dorsi", "Rear Delts"],
    searchKeywords: ["front delts", "military press", "front raises"],
  },
  shoulders_lateral: {
    diagramId: "shoulders_lateral",
    exerciseGroup: "Shoulders",
    displayName: "Lateral Deltoids (Side)",
    latinName: "Lateral Deltoid",
    category: "Push",
    view: "both",
    functionDescription: "Abducts the arm away from the body; provides shoulder width and V-taper cap appearance.",
    synergists: ["Supraspinatus", "Trapezius"],
    antagonists: ["Latissimus Dorsi"],
    searchKeywords: ["lateral raise", "side delt", "shoulder width"],
  },
  rear_delts: {
    diagramId: "rear_delts",
    exerciseGroup: "Shoulders",
    displayName: "Rear Deltoids (Posterior)",
    latinName: "Posterior Deltoid",
    category: "Pull",
    view: "back",
    functionDescription: "Pulls arms horizontally backward and rotates shoulders outward; essential for posture and shoulder health.",
    synergists: ["Rhomboids", "Infraspinatus", "Middle Trapezius"],
    antagonists: ["Chest", "Front Delts"],
    searchKeywords: ["face pull", "reverse fly", "rear delts", "posture"],
  },

  // ─── ARMS: BICEPS & TRICEPS & FOREARMS ──────────────
  biceps: {
    diagramId: "biceps",
    exerciseGroup: "Arms",
    displayName: "Biceps",
    latinName: "Biceps Brachii & Brachialis",
    category: "Pull",
    view: "front",
    functionDescription: "Flexes the elbow and supinates (rotates palm up) the forearm; assists in vertical and horizontal pulling.",
    synergists: ["Brachialis", "Brachioradialis"],
    antagonists: ["Triceps Brachii"],
    searchKeywords: ["curls", "bicep", "arm", "preacher", "hammer"],
  },
  triceps: {
    diagramId: "triceps",
    exerciseGroup: "Arms",
    displayName: "Triceps",
    latinName: "Triceps Brachii",
    category: "Push",
    view: "back",
    functionDescription: "Extends the elbow joint; constitutes ~60% of upper arm mass and powers pressing lockouts.",
    synergists: ["Chest", "Anterior Deltoids"],
    antagonists: ["Biceps Brachii"],
    searchKeywords: ["pushdown", "skull crusher", "tricep", "dips", "extension"],
  },
  forearms: {
    diagramId: "forearms",
    exerciseGroup: "Arms",
    displayName: "Forearms",
    latinName: "Brachioradialis, Flexors & Extensors",
    category: "Pull",
    view: "both",
    functionDescription: "Controls wrist flexion, extension, and finger grip strength for all pulling and carrying lifts.",
    synergists: ["Biceps Brachii"],
    antagonists: ["Forearm Antagonists"],
    searchKeywords: ["grip", "wrist curl", "farmer walk", "forearm"],
  },
  forearms_flexors: {
    diagramId: "forearms_flexors",
    exerciseGroup: "Arms",
    displayName: "Forearm Flexors",
    latinName: "Flexor Carpi Radialis & Ulnaris",
    category: "Pull",
    view: "front",
    functionDescription: "Flexes wrist toward inner forearm and closes fingers tightly for crushing grip.",
    synergists: ["Brachioradialis"],
    antagonists: ["Forearm Extensors"],
    searchKeywords: ["wrist curls", "grip"],
  },
  forearms_extensors: {
    diagramId: "forearms_extensors",
    exerciseGroup: "Arms",
    displayName: "Forearm Extensors & Brachioradialis",
    latinName: "Extensor Digitorum & Brachioradialis",
    category: "Pull",
    view: "back",
    functionDescription: "Extends wrist backward and balances grip strength; protects against elbow tendonitis.",
    synergists: ["Brachioradialis"],
    antagonists: ["Forearm Flexors"],
    searchKeywords: ["reverse curl", "wrist extension"],
  },

  // ─── CORE & ABDOMINALS ──────────────────────────────
  abs: {
    diagramId: "abs",
    exerciseGroup: "Core",
    displayName: "Abs (Rectus Abdominis)",
    latinName: "Rectus Abdominis",
    category: "Core",
    view: "front",
    functionDescription: "Flexes the spine forward, compresses abdominal cavity, stabilizes pelvis and spine under load.",
    synergists: ["Obliques", "Transverse Abdominis"],
    antagonists: ["Erector Spinae"],
    searchKeywords: ["crunches", "plank", "ab", "core", "leg raise"],
  },
  abs_upper: {
    diagramId: "abs_upper",
    exerciseGroup: "Core",
    displayName: "Upper Abs",
    latinName: "Rectus Abdominis (Superior)",
    category: "Core",
    view: "front",
    functionDescription: "Curls the ribcage downward toward the pelvis; targeted in standard and cable crunches.",
    synergists: ["Obliques"],
    antagonists: ["Erector Spinae"],
    searchKeywords: ["crunch", "cable crunch"],
  },
  abs_mid: {
    diagramId: "abs_mid",
    exerciseGroup: "Core",
    displayName: "Mid Abs",
    latinName: "Rectus Abdominis (Intermediate)",
    category: "Core",
    view: "front",
    functionDescription: "Stabilizes trunk against intra-abdominal pressure; central section of the six-pack.",
    synergists: ["Obliques"],
    antagonists: ["Erector Spinae"],
    searchKeywords: ["hollow hold", "plank"],
  },
  abs_lower: {
    diagramId: "abs_lower",
    exerciseGroup: "Core",
    displayName: "Lower Abs",
    latinName: "Rectus Abdominis (Inferior)",
    category: "Core",
    view: "front",
    functionDescription: "Pulls pelvis upward toward sternum; targeted in hanging leg raises and reverse crunches.",
    synergists: ["Iliopsoas", "Obliques"],
    antagonists: ["Erector Spinae"],
    searchKeywords: ["leg raises", "reverse crunch", "dead bug"],
  },
  obliques: {
    diagramId: "obliques",
    exerciseGroup: "Core",
    displayName: "Obliques & Serratus",
    latinName: "External Obliques & Serratus Anterior",
    category: "Core",
    view: "front",
    functionDescription: "Rotates and side-bends the torso; creates tapered waistline and scapular upward rotation.",
    synergists: ["Internal Obliques", "Transverse Abdominis"],
    antagonists: ["Contralateral Obliques"],
    searchKeywords: ["russian twist", "side plank", "woodchoppers", "obliques"],
  },

  // ─── BACK & TRAPS ───────────────────────────────────
  back: {
    diagramId: "back",
    exerciseGroup: "Back",
    displayName: "Back",
    latinName: "Dorsum Musculature",
    category: "Pull",
    view: "back",
    functionDescription: "Primary posterior chain pullers; supports upright spine posture, pulls weight toward body.",
    synergists: ["Biceps Brachii", "Rear Delts"],
    antagonists: ["Chest", "Front Delts"],
    searchKeywords: ["pullup", "row", "lat pulldown", "back"],
  },
  traps: {
    diagramId: "traps",
    exerciseGroup: "Back",
    displayName: "Trapezius",
    latinName: "Trapezius",
    category: "Pull",
    view: "both",
    functionDescription: "Elevates, retracts, and depresses scapula; provides neck and upper spine armor and strength.",
    synergists: ["Levator Scapulae", "Rhomboids"],
    antagonists: ["Pectoralis Minor"],
    searchKeywords: ["shrugs", "traps", "face pulls", "farmer carry"],
  },
  traps_upper: {
    diagramId: "traps_upper",
    exerciseGroup: "Back",
    displayName: "Upper Traps",
    latinName: "Trapezius Pars Descendens",
    category: "Pull",
    view: "both",
    functionDescription: "Elevates the shoulder girdle; heavily activated in shrugs, deadlifts, and farmer's walks.",
    synergists: ["Levator Scapulae"],
    antagonists: ["Lower Trapezius"],
    searchKeywords: ["shrugs", "trap bar"],
  },
  traps_mid_lower: {
    diagramId: "traps_mid_lower",
    exerciseGroup: "Back",
    displayName: "Mid & Lower Traps",
    latinName: "Trapezius Pars Transversa & Ascendens",
    category: "Pull",
    view: "back",
    functionDescription: "Retracts and depresses scapulae; crucial for shoulder blade stability and preventing rounded posture.",
    synergists: ["Rhomboids"],
    antagonists: ["Pectoralis Minor"],
    searchKeywords: ["face pulls", "rows", "y-raises"],
  },
  lats: {
    diagramId: "lats",
    exerciseGroup: "Back",
    displayName: "Lats (Latissimus Dorsi)",
    latinName: "Latissimus Dorsi",
    category: "Pull",
    view: "both",
    functionDescription: "Draws the upper arms down and back; forms the broad athletic V-taper wing aesthetic.",
    synergists: ["Teres Major", "Biceps Brachii"],
    antagonists: ["Deltoids", "Chest"],
    searchKeywords: ["pullup", "lat pulldown", "pullover", "lats"],
  },
  rhomboids: {
    diagramId: "rhomboids",
    exerciseGroup: "Back",
    displayName: "Rhomboids & Teres",
    latinName: "Rhomboideus Major & Minor, Teres Major",
    category: "Pull",
    view: "back",
    functionDescription: "Pulls shoulder blades together tightly; thickens the upper-mid back and stabilizes heavy pulling.",
    synergists: ["Middle Trapezius", "Lats"],
    antagonists: ["Serratus Anterior"],
    searchKeywords: ["seated row", "chest supported row", "rhomboids"],
  },
  rhomboids_teres: {
    diagramId: "rhomboids_teres",
    exerciseGroup: "Back",
    displayName: "Rhomboids & Teres Major",
    latinName: "Rhomboids & Teres Complex",
    category: "Pull",
    view: "back",
    functionDescription: "Scapular retraction and arm adduction; upper back wing thickness.",
    synergists: ["Middle Trapezius", "Lats"],
    antagonists: ["Serratus Anterior"],
    searchKeywords: ["rows", "cable row"],
  },
  lower_back: {
    diagramId: "lower_back",
    exerciseGroup: "Back",
    displayName: "Lower Back (Erector Spinae)",
    latinName: "Erector Spinae",
    category: "Pull",
    view: "back",
    functionDescription: "Straightens and extends the spine; anchors the entire torso under heavy compound axial loads.",
    synergists: ["Glutes", "Hamstrings"],
    antagonists: ["Rectus Abdominis"],
    searchKeywords: ["deadlift", "back extension", "superman", "good mornings"],
  },

  // ─── LEGS & LOWER BODY ──────────────────────────────
  legs: {
    diagramId: "legs",
    exerciseGroup: "Legs",
    displayName: "Legs",
    latinName: "Lower Extremity Musculature",
    category: "Legs",
    view: "both",
    functionDescription: "Foundational locomotion and explosive strength; powers squats, lunges, sprinting, and jumping.",
    synergists: ["Glutes", "Quads", "Hamstrings", "Calves"],
    antagonists: [],
    searchKeywords: ["squat", "leg", "lunge"],
  },
  quads: {
    diagramId: "quads",
    exerciseGroup: "Legs",
    displayName: "Quadriceps",
    latinName: "Quadriceps Femoris",
    category: "Legs",
    view: "front",
    functionDescription: "Extends the knee joint and absorbs impact; prime mover for squats, lunges, and leg presses.",
    synergists: ["Gluteus Maximus", "Adductors"],
    antagonists: ["Hamstrings"],
    searchKeywords: ["squat", "leg press", "lunge", "quad"],
  },
  quadriceps: {
    diagramId: "quadriceps",
    exerciseGroup: "Legs",
    displayName: "Quadriceps",
    latinName: "Quadriceps Femoris",
    category: "Legs",
    view: "front",
    functionDescription: "Extends knee; built through squats, split squats, and leg presses.",
    synergists: ["Glutes"],
    antagonists: ["Hamstrings"],
    searchKeywords: ["squat", "quadriceps"],
  },
  quads_rectus: {
    diagramId: "quads_rectus",
    exerciseGroup: "Legs",
    displayName: "Rectus Femoris (Center Quad)",
    latinName: "Rectus Femoris",
    category: "Legs",
    view: "front",
    functionDescription: "Bi-articular quad head crossing both hip and knee; flexes hip and extends knee.",
    synergists: ["Vastus Lateralis", "Vastus Medialis"],
    antagonists: ["Hamstrings"],
    searchKeywords: ["squat", "leg extension"],
  },
  quads_lateralis: {
    diagramId: "quads_lateralis",
    exerciseGroup: "Legs",
    displayName: "Vastus Lateralis (Outer Quad)",
    latinName: "Vastus Lateralis",
    category: "Legs",
    view: "front",
    functionDescription: "Largest quadricep belly creating outer thigh sweep; powerful knee extension.",
    synergists: ["Vastus Medialis"],
    antagonists: ["Biceps Femoris"],
    searchKeywords: ["squat", "leg press"],
  },
  quads_medialis: {
    diagramId: "quads_medialis",
    exerciseGroup: "Legs",
    displayName: "Vastus Medialis (Teardrop)",
    latinName: "Vastus Medialis",
    category: "Legs",
    view: "front",
    functionDescription: "Teardrop muscle directly above the medial kneecap; terminal knee extension and patella tracking.",
    synergists: ["Vastus Lateralis"],
    antagonists: ["Semitendinosus"],
    searchKeywords: ["cyclist squat", "leg extension", "teardrop"],
  },
  adductors: {
    diagramId: "adductors",
    exerciseGroup: "Legs",
    displayName: "Adductors (Inner Thigh)",
    latinName: "Adductor Longus, Brevis & Magnus",
    category: "Legs",
    view: "front",
    functionDescription: "Pulls legs toward body midline; crucial for hip stabilization and depth in wide squats.",
    synergists: ["Gracilis", "Pectineus"],
    antagonists: ["Gluteus Medius", "TFL"],
    searchKeywords: ["sumo squat", "copenhagen plank", "adductor"],
  },
  glutes: {
    diagramId: "glutes",
    exerciseGroup: "Legs",
    displayName: "Glutes",
    latinName: "Gluteus Maximus, Medius & Minimus",
    category: "Legs",
    view: "back",
    functionDescription: "Largest, most powerful muscles in human body; drives hip extension, thrusts, jumping, and stability.",
    synergists: ["Hamstrings", "Adductor Magnus"],
    antagonists: ["Iliopsoas", "Rectus Femoris"],
    searchKeywords: ["hip thrust", "squat", "deadlift", "glute bridge", "glutes"],
  },
  glutes_maximus: {
    diagramId: "glutes_maximus",
    exerciseGroup: "Legs",
    displayName: "Gluteus Maximus",
    latinName: "Gluteus Maximus",
    category: "Legs",
    view: "back",
    functionDescription: "Main extensor of the hip joint; powers deadlifts, hip thrusts, and sprint acceleration.",
    synergists: ["Hamstrings"],
    antagonists: ["Hip Flexors"],
    searchKeywords: ["hip thrust", "glute bridge"],
  },
  glutes_medius: {
    diagramId: "glutes_medius",
    exerciseGroup: "Legs",
    displayName: "Gluteus Medius (Upper Hip)",
    latinName: "Gluteus Medius",
    category: "Legs",
    view: "back",
    functionDescription: "Abducts thigh and stabilizes pelvis during single-leg stance, walking, and running.",
    synergists: ["Tensor Fasciae Latae"],
    antagonists: ["Adductors"],
    searchKeywords: ["bulgarian split squat", "lateral band walk"],
  },
  hamstrings: {
    diagramId: "hamstrings",
    exerciseGroup: "Legs",
    displayName: "Hamstrings",
    latinName: "Biceps Femoris, Semitendinosus & Semimembranosus",
    category: "Legs",
    view: "back",
    functionDescription: "Flexes the knee and extends the hip; essential for sprinting speed, hinge power, and knee stabilization.",
    synergists: ["Gluteus Maximus", "Adductor Magnus"],
    antagonists: ["Quadriceps"],
    searchKeywords: ["romanian deadlift", "rdl", "leg curl", "nordic curl", "hamstrings"],
  },
  calves: {
    diagramId: "calves",
    exerciseGroup: "Legs",
    displayName: "Calves",
    latinName: "Gastrocnemius & Soleus",
    category: "Legs",
    view: "both",
    functionDescription: "Plantarflexes foot (lifts heel); powers running push-off, jumping, and ankle stability.",
    synergists: ["Plantaris", "Tibialis Posterior"],
    antagonists: ["Tibialis Anterior"],
    searchKeywords: ["calf raise", "standing calf", "calves"],
  },
  calves_gastroc: {
    diagramId: "calves_gastroc",
    exerciseGroup: "Legs",
    displayName: "Gastrocnemius (Diamond Calf)",
    latinName: "Gastrocnemius Medial & Lateral Heads",
    category: "Legs",
    view: "back",
    functionDescription: "Upper dual-headed calf muscle active when knees are straight; builds high-calf diamond definition.",
    synergists: ["Soleus"],
    antagonists: ["Tibialis Anterior"],
    searchKeywords: ["standing calf raise", "jump rope"],
  },
  calves_soleus: {
    diagramId: "calves_soleus",
    exerciseGroup: "Legs",
    displayName: "Soleus & Achilles",
    latinName: "Soleus & Tendo Calcaneus",
    category: "Legs",
    view: "back",
    functionDescription: "Deep endurance calf muscle active when knee is bent; major shock absorber in running and jumping.",
    synergists: ["Gastrocnemius"],
    antagonists: ["Tibialis Anterior"],
    searchKeywords: ["seated calf raise"],
  },
  calves_front: {
    diagramId: "calves_front",
    exerciseGroup: "Legs",
    displayName: "Tibialis Anterior (Shins)",
    latinName: "Tibialis Anterior",
    category: "Legs",
    view: "front",
    functionDescription: "Dorsiflexes foot (pulls toes upward); crucial for knee health, deceleration, and shin splint prevention.",
    synergists: ["Extensor Digitorum Longus"],
    antagonists: ["Gastrocnemius", "Soleus"],
    searchKeywords: ["tibialis raise", "toe raises"],
  },
  calves_tibialis: {
    diagramId: "calves_tibialis",
    exerciseGroup: "Legs",
    displayName: "Tibialis Anterior (Shin Muscle)",
    latinName: "Tibialis Anterior",
    category: "Legs",
    view: "front",
    functionDescription: "Front lower leg muscle pulling toes up; balances calf development and protects knees.",
    synergists: ["Peroneus Tertius"],
    antagonists: ["Calves"],
    searchKeywords: ["tibialis", "toe raise"],
  },
  calves_back: {
    diagramId: "calves_back",
    exerciseGroup: "Legs",
    displayName: "Calves (Posterior)",
    latinName: "Gastrocnemius & Soleus",
    category: "Legs",
    view: "back",
    functionDescription: "Posterior lower leg muscles powering ankle extension.",
    synergists: ["Soleus"],
    antagonists: ["Tibialis Anterior"],
    searchKeywords: ["calf raise"],
  },

  // ─── NECK ───────────────────────────────────────────
  neck: {
    diagramId: "neck",
    exerciseGroup: "Shoulders",
    displayName: "Neck",
    latinName: "Sternocleidomastoideus & Splenius",
    category: "Push",
    view: "both",
    functionDescription: "Supports cervical spine, rotates and flexes the head, protects head and brain during contact.",
    synergists: ["Upper Trapezius"],
    antagonists: ["Deep Cervical Extensors"],
    searchKeywords: ["neck curl", "isometric", "shrugs"],
  },

  // ─── MUSCLEWIKI / HIGH-FIDELITY VECTOR ALIASES ──────
  deltoids: {
    diagramId: "deltoids",
    exerciseGroup: "Shoulders",
    displayName: "Shoulders (Deltoids)",
    latinName: "Deltoideus",
    category: "Push",
    view: "both",
    functionDescription: "Lifts and rotates arms in 3 dimensions; overhead pressing, lateral raises, and shoulder stabilization.",
    synergists: ["Triceps Brachii", "Upper Trapezius"],
    antagonists: ["Latissimus Dorsi"],
    searchKeywords: ["delts", "overhead", "press", "raises", "shoulders"],
  },
  forearm: {
    diagramId: "forearm",
    exerciseGroup: "Arms",
    displayName: "Forearms",
    latinName: "Brachioradialis, Flexors & Extensors",
    category: "Pull",
    view: "both",
    functionDescription: "Controls wrist flexion, extension, and finger grip strength for all pulling and carrying lifts.",
    synergists: ["Biceps Brachii"],
    antagonists: ["Forearm Extensors"],
    searchKeywords: ["grip", "wrist curl", "farmer walk", "forearms"],
  },
  gluteal: {
    diagramId: "gluteal",
    exerciseGroup: "Legs",
    displayName: "Glutes",
    latinName: "Gluteus Maximus, Medius & Minimus",
    category: "Legs",
    view: "back",
    functionDescription: "Powerful hip extension and pelvic stabilization; powers squats, deadlifts, and hip thrusts.",
    synergists: ["Hamstrings", "Adductor Magnus"],
    antagonists: ["Iliopsoas", "Rectus Femoris"],
    searchKeywords: ["hip thrust", "glute bridge", "squat", "deadlift", "glutes"],
  },
  hamstring: {
    diagramId: "hamstring",
    exerciseGroup: "Legs",
    displayName: "Hamstrings",
    latinName: "Biceps Femoris, Semitendinosus & Semimembranosus",
    category: "Legs",
    view: "back",
    functionDescription: "Flexes the knee and extends the hip; essential for sprinting speed, hinge power, and knee stabilization.",
    synergists: ["Gluteus Maximus", "Adductor Magnus"],
    antagonists: ["Quadriceps"],
    searchKeywords: ["romanian deadlift", "rdl", "leg curl", "nordic curl", "hamstrings"],
  },
  "upper-back": {
    diagramId: "upper-back",
    exerciseGroup: "Back",
    displayName: "Upper Back & Lats",
    latinName: "Latissimus Dorsi, Rhomboids & Mid Traps",
    category: "Pull",
    view: "back",
    functionDescription: "Pulls arms down and back, builds V-taper width and mid-back thickness.",
    synergists: ["Biceps Brachii", "Rear Delts"],
    antagonists: ["Chest", "Front Delts"],
    searchKeywords: ["lat pulldown", "pull-ups", "rows", "back", "lats"],
  },
  "lower-back": {
    diagramId: "lower-back",
    exerciseGroup: "Back",
    displayName: "Lower Back (Erectors)",
    latinName: "Erector Spinae & Quadratus Lumborum",
    category: "Pull",
    view: "back",
    functionDescription: "Extends and stabilizes the lumbar spine; crucial for deadlift lockout, posture, and core stiffness.",
    synergists: ["Glutes", "Hamstrings"],
    antagonists: ["Rectus Abdominis"],
    searchKeywords: ["hyperextensions", "deadlift", "good mornings", "lower back"],
  },
  trapezius: {
    diagramId: "trapezius",
    exerciseGroup: "Back",
    displayName: "Trapezius (Traps)",
    latinName: "Trapezius (Superior, Middle & Inferior)",
    category: "Pull",
    view: "back",
    functionDescription: "Elevates, retracts, and depresses the scapulae; frames the neck and upper back.",
    synergists: ["Levator Scapulae", "Rhomboids"],
    antagonists: ["Serratus Anterior", "Pectoralis Minor"],
    searchKeywords: ["shrugs", "face pulls", "rack pulls", "traps"],
  },
  tibialis: {
    diagramId: "tibialis",
    exerciseGroup: "Legs",
    displayName: "Tibialis Anterior (Shins)",
    latinName: "Tibialis Anterior",
    category: "Legs",
    view: "front",
    functionDescription: "Dorsiflexes foot (pulls toes upward); crucial for knee health, deceleration, and shin splint prevention.",
    synergists: ["Extensor Digitorum Longus"],
    antagonists: ["Gastrocnemius", "Soleus"],
    searchKeywords: ["tibialis raise", "toe raises", "shins"],
  },
  knees: {
    diagramId: "knees",
    exerciseGroup: "Legs",
    displayName: "Knee Joints & Patella",
    latinName: "Articulatio Genus & Patellar Tendon",
    category: "Legs",
    view: "both",
    functionDescription: "Knee joint stability, patellar tendon health, and bulletproofing lower limb connective tissue.",
    synergists: ["Quadriceps", "Hamstrings"],
    antagonists: [],
    searchKeywords: ["squat", "leg extension", "tibialis", "step up"],
  },
  ankles: {
    diagramId: "ankles",
    exerciseGroup: "Legs",
    displayName: "Ankles & Achilles Tendon",
    latinName: "Articulatio Talocruralis",
    category: "Legs",
    view: "both",
    functionDescription: "Ankle mobility, dorsiflexion range of motion, and Achilles tendon resilience.",
    synergists: ["Calves", "Tibialis"],
    antagonists: [],
    searchKeywords: ["calf raise", "tibialis raise", "ankle mobility"],
  },
};

/**
 * Get exercise group from diagram muscle ID
 */
export function getExerciseGroupFromDiagramId(diagramId: string): string | null {
  if (!diagramId) return null;
  const mapping = MUSCLE_MAPPINGS[diagramId.toLowerCase()];
  return mapping ? mapping.exerciseGroup : null;
}

/**
 * Get display name from diagram muscle ID
 */
export function getDisplayNameFromDiagramId(diagramId: string): string {
  if (!diagramId) return diagramId;
  const mapping = MUSCLE_MAPPINGS[diagramId.toLowerCase()];
  return mapping ? mapping.displayName : diagramId;
}

/**
 * Get route path for a muscle group
 */
export function getMuscleRoute(diagramId: string): string {
  if (!diagramId) return "/exercises";
  const normalizedId = diagramId.toLowerCase();
  // Map internal granular IDs to route-friendly primary muscle IDs
  const routeAlias: Record<string, string> = {
    chest_upper: "chest",
    chest_lower: "chest",
    shoulders_front: "shoulders",
    shoulders_lateral: "shoulders",
    rear_delts: "shoulders",
    deltoids: "shoulders",
    traps_upper: "traps",
    traps_mid_lower: "traps",
    trapezius: "traps",
    "upper-back": "back",
    "lower-back": "lower_back",
    rhomboids_teres: "back",
    forearms_flexors: "forearms",
    forearms_extensors: "forearms",
    forearm: "forearms",
    abs_upper: "abs",
    abs_mid: "abs",
    abs_lower: "abs",
    quads_rectus: "quads",
    quads_lateralis: "quads",
    quads_medialis: "quads",
    quadriceps: "quads",
    glutes_maximus: "glutes",
    glutes_medius: "glutes",
    gluteal: "glutes",
    hamstring: "hamstrings",
    calves_gastroc: "calves",
    calves_soleus: "calves",
    calves_tibialis: "calves",
    tibialis: "calves",
    calves_front: "calves",
    calves_back: "calves",
    knees: "legs",
    ankles: "legs",
  };

  const finalId = routeAlias[normalizedId] || normalizedId;
  return `/exercises/${finalId}`;
}

/**
 * Check if a muscle ID has associated exercises
 */
export function hasExercises(diagramId: string): boolean {
  if (!diagramId) return false;
  return getExerciseGroupFromDiagramId(diagramId) !== null;
}

/**
 * Dynamically queries actual exercises matching a muscle ID from the exercise database.
 * Matches by primary exerciseGroup and ranks exercises matching specific keywords first.
 */
export function getExercisesForMuscle(diagramId: string): {
  exercises: Exercise[];
  count: number;
  mapping: MuscleMapping | null;
} {
  if (!diagramId) {
    return { exercises: [], count: 0, mapping: null };
  }

  const mapping = MUSCLE_MAPPINGS[diagramId.toLowerCase()];
  if (!mapping) {
    return { exercises: [], count: 0, mapping: null };
  }

  const group = mapping.exerciseGroup;
  const keywords = (mapping.searchKeywords || [mapping.displayName.toLowerCase()]).map(k => k.toLowerCase());

  // All exercises in the parent group
  const groupExercises = exercises.filter(
    (ex) => ex.muscleGroup.toLowerCase() === group.toLowerCase()
  );

  // Score exercises: those mentioning specific sub-target keywords in name or description rank higher
  const scored = groupExercises.map((ex) => {
    let score = 0;
    const nameLower = ex.name.toLowerCase();
    const descLower = (ex.description || "").toLowerCase();

    for (const kw of keywords) {
      if (nameLower.includes(kw)) score += 3;
      if (descLower.includes(kw)) score += 1;
    }

    return { exercise: ex, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const matched = scored.map((s) => s.exercise);

  return {
    exercises: matched,
    count: matched.length,
    mapping,
  };
}

/**
 * Muscle Split Preset Definitions
 * Used for quick illumination of Push, Pull, Legs, and Core muscle groups.
 */
export const SPLIT_PRESETS: Record<"all" | "push" | "pull" | "legs" | "core", string[]> = {
  all: [],
  push: [
    "chest", "chest_upper", "chest_lower",
    "shoulders", "shoulders_front", "shoulders_lateral", "deltoids",
    "triceps"
  ],
  pull: [
    "back", "lats", "traps", "traps_upper", "traps_mid_lower", "trapezius",
    "rhomboids", "rhomboids_teres", "rear_delts", "upper-back",
    "biceps", "forearms", "forearms_flexors", "forearms_extensors", "forearm",
    "lower_back", "lower-back"
  ],
  legs: [
    "legs", "quads", "quads_rectus", "quads_lateralis", "quads_medialis", "quadriceps",
    "hamstrings", "hamstring", "glutes", "glutes_maximus", "glutes_medius", "gluteal",
    "adductors", "calves", "calves_gastroc", "calves_soleus", "calves_tibialis", "calves_front", "tibialis",
    "knees", "ankles"
  ],
  core: [
    "abs", "abs_upper", "abs_mid", "abs_lower",
    "obliques", "lower_back", "lower-back"
  ],
};
