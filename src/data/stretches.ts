/**
 * FitBox Stretches Database — MuscleWiki-style Flexibility & Mobility Library
 *
 * Each stretch is mapped to a specific muscle group with detailed instructions,
 * hold durations, and difficulty levels. Designed to mirror MuscleWiki's
 * stretches section where clicking a muscle on the body map shows targeted
 * stretches for that area.
 */

export interface Stretch {
  id: string;
  name: string;
  muscleGroup: string;
  /** More specific target within the group */
  targetArea: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  holdDuration: string;
  equipment: string;
  category: 'Static' | 'Dynamic' | 'PNF' | 'Active';
  instructions: string[];
  tips: string[];
  description: string;
}

export const stretches: Stretch[] = [
  // ──────────────────────────────────────────────────────
  // CHEST
  // ──────────────────────────────────────────────────────
  {
    id: 's1',
    name: 'Doorway Chest Stretch',
    muscleGroup: 'Chest',
    targetArea: 'Pectoralis Major & Minor',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec each side',
    equipment: 'Doorway',
    category: 'Static',
    instructions: [
      'Stand in a doorway and place your forearm against the door frame at 90 degrees.',
      'Step forward with the same-side foot until you feel a stretch across your chest.',
      'Keep your shoulder blade pulled back and down throughout.',
      'Hold for the prescribed duration, then switch sides.',
    ],
    tips: [
      'Adjust arm height to target different fibers — higher for lower pecs, lower for upper pecs.',
      'Avoid arching your lower back; engage your core.',
    ],
    description: 'Opens up the chest and anterior shoulders; essential for counteracting desk posture and bench press tightness.',
  },
  {
    id: 's2',
    name: 'Supine Floor Chest Opener',
    muscleGroup: 'Chest',
    targetArea: 'Pectoralis Major, Anterior Deltoids',
    difficulty: 'Beginner',
    holdDuration: '45-60 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Lie face up on the floor with arms extended out to your sides, palms up.',
      'Bend your knees and place feet flat on the floor.',
      'Allow gravity to gently pull your arms toward the ground.',
      'Breathe deeply and let your chest open progressively with each exhale.',
    ],
    tips: [
      'Place a foam roller lengthwise under your spine for a deeper stretch.',
      'Focus on relaxing the front deltoids completely.',
    ],
    description: 'Passive gravity-assisted stretch that deeply opens the chest and front shoulders.',
  },
  {
    id: 's3',
    name: 'Behind-the-Back Clasp Stretch',
    muscleGroup: 'Chest',
    targetArea: 'Pectoralis Minor, Biceps, Anterior Deltoids',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Stand tall and clasp your hands behind your lower back.',
      'Straighten your arms and gently lift them away from your body.',
      'Squeeze your shoulder blades together and puff your chest forward.',
      'Hold and breathe deeply.',
    ],
    tips: [
      'If you cannot clasp hands, hold a towel or strap between them.',
      'Keep your chin tucked slightly to avoid neck strain.',
    ],
    description: 'Quick standing stretch for the chest and biceps that can be performed anywhere.',
  },

  // ──────────────────────────────────────────────────────
  // SHOULDERS
  // ──────────────────────────────────────────────────────
  {
    id: 's4',
    name: 'Cross-Body Shoulder Stretch',
    muscleGroup: 'Shoulders',
    targetArea: 'Posterior Deltoid, Infraspinatus',
    difficulty: 'Beginner',
    holdDuration: '30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Bring one arm across the front of your chest at shoulder height.',
      'Use the opposite hand to press the upper arm toward your body.',
      'Keep the stretching shoulder down — avoid shrugging.',
      'Hold, then switch sides.',
    ],
    tips: [
      'Rotate your upper torso slightly away from the stretching arm for deeper effect.',
      'This stretch targets the posterior capsule and rear deltoids.',
    ],
    description: 'The most common shoulder stretch targeting rear delts and posterior shoulder capsule.',
  },
  {
    id: 's5',
    name: 'Overhead Tricep & Lat Stretch',
    muscleGroup: 'Shoulders',
    targetArea: 'Lateral Deltoid, Triceps, Latissimus Dorsi',
    difficulty: 'Beginner',
    holdDuration: '30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Raise one arm overhead and bend the elbow so your hand reaches behind your neck.',
      'Use the opposite hand to gently press the elbow further behind your head.',
      'Lean slightly to the opposite side to add a lat stretch component.',
      'Hold and breathe.',
    ],
    tips: [
      'Keep your core braced to prevent excessive rib flare.',
      'This stretch simultaneously targets the shoulder, tricep, and lat.',
    ],
    description: 'Compound overhead stretch hitting the lateral deltoid, tricep long head, and upper lat.',
  },
  {
    id: 's6',
    name: 'Thread the Needle',
    muscleGroup: 'Shoulders',
    targetArea: 'Posterior Deltoid, Thoracic Spine, Rhomboids',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Start on all fours in a tabletop position.',
      'Slide one arm under your body, palm facing up, and lower your shoulder to the floor.',
      'Rest your temple on the ground and extend the opposite arm overhead or press into the floor.',
      'Hold and breathe into the stretch through the mid-back.',
    ],
    tips: [
      'Focus on thoracic rotation rather than forcing your shoulder down.',
      'Excellent for desk workers with rounded upper backs.',
    ],
    description: 'Thoracic rotation stretch that deeply opens the posterior shoulder and mid-back.',
  },
  {
    id: 's7',
    name: 'Wall Slides (Shoulder CARs)',
    muscleGroup: 'Shoulders',
    targetArea: 'Rotator Cuff, Scapular Stabilizers',
    difficulty: 'Intermediate',
    holdDuration: '10-12 reps',
    equipment: 'Wall',
    category: 'Dynamic',
    instructions: [
      'Stand with your back flat against a wall, feet 6 inches from the wall.',
      'Press your head, upper back, and lower back into the wall.',
      'Place arms in a "cactus" position — elbows at 90° against the wall.',
      'Slowly slide arms up overhead while maintaining full wall contact.',
      'Slide back down. Repeat for prescribed reps.',
    ],
    tips: [
      'If your lower back arches off the wall, posterior pelvic tilt to pin it back.',
      'This is both a stretch and a shoulder stability drill.',
    ],
    description: 'Active shoulder mobility drill improving scapular upward rotation and overhead range of motion.',
  },

  // ──────────────────────────────────────────────────────
  // BACK
  // ──────────────────────────────────────────────────────
  {
    id: 's8',
    name: 'Cat-Cow Stretch',
    muscleGroup: 'Back',
    targetArea: 'Erector Spinae, Thoracic Spine, Abs',
    difficulty: 'Beginner',
    holdDuration: '10-15 reps (flow)',
    equipment: 'None',
    category: 'Dynamic',
    instructions: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Inhale: Arch your back, drop your belly, lift your chin and tailbone (Cow).',
      'Exhale: Round your spine toward the ceiling, tuck your chin and pelvis (Cat).',
      'Flow smoothly between positions for the prescribed repetitions.',
    ],
    tips: [
      'Initiate movement from the pelvis and let the wave travel through the spine.',
      'Move slowly and mindfully — this is spinal segmentation work.',
    ],
    description: 'Foundational spinal mobilization that gently flexes and extends the entire vertebral column.',
  },
  {
    id: 's9',
    name: 'Child\'s Pose',
    muscleGroup: 'Back',
    targetArea: 'Latissimus Dorsi, Erector Spinae, Shoulders',
    difficulty: 'Beginner',
    holdDuration: '45-60 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Kneel on the floor and sit your hips back toward your heels.',
      'Walk your hands forward as far as you can, reaching arms overhead on the floor.',
      'Lower your forehead to the ground and relax your entire upper body.',
      'Breathe deeply into your lower back and sides.',
    ],
    tips: [
      'Widen your knees for more hip opening; narrow for more spinal decompression.',
      'Reach arms to one side for a targeted lateral lat stretch.',
    ],
    description: 'Restorative pose that decompresses the spine and stretches the lats, back extensors, and shoulders.',
  },
  {
    id: 's10',
    name: 'Seated Spinal Twist',
    muscleGroup: 'Back',
    targetArea: 'Thoracic Spine, Obliques, Erector Spinae',
    difficulty: 'Beginner',
    holdDuration: '30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Sit on the floor with legs extended. Cross one leg over the other, foot flat on floor.',
      'Place the opposite elbow on the outside of the bent knee.',
      'Twist your torso toward the bent knee, looking over your shoulder.',
      'Use the elbow to deepen the rotation gently. Hold and breathe.',
    ],
    tips: [
      'Sit on a folded towel if your hamstrings are tight.',
      'Focus on lengthening the spine upward before rotating.',
    ],
    description: 'Targets thoracic rotational mobility and stretches the obliques and erector spinae.',
  },
  {
    id: 's11',
    name: 'Hanging Lat Stretch (Dead Hang)',
    muscleGroup: 'Back',
    targetArea: 'Latissimus Dorsi, Teres Major, Thoracic Spine',
    difficulty: 'Intermediate',
    holdDuration: '20-30 sec',
    equipment: 'Pull-up Bar',
    category: 'Static',
    instructions: [
      'Grip a pull-up bar with an overhand grip, hands shoulder-width apart.',
      'Let your body hang with arms fully extended — relax completely.',
      'Allow your lats to fully stretch and spine to decompress under body weight.',
      'Hold and breathe deeply; try to relax your shoulders away from your ears.',
    ],
    tips: [
      'Use grip aids if grip strength limits your hold time.',
      'Add gentle swaying or rotation for a dynamic lat mobilization.',
    ],
    description: 'Gravity-assisted lat and thoracic decompression stretch; also builds grip endurance.',
  },

  // ──────────────────────────────────────────────────────
  // ARMS (Biceps, Triceps, Forearms)
  // ──────────────────────────────────────────────────────
  {
    id: 's12',
    name: 'Wall Bicep Stretch',
    muscleGroup: 'Arms',
    targetArea: 'Biceps Brachii, Anterior Forearm',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'Wall',
    category: 'Static',
    instructions: [
      'Stand facing away from a wall. Place one palm flat on the wall behind you, fingers pointing down.',
      'Slowly step forward and slightly rotate your body away from the wall arm.',
      'You should feel a deep stretch along the bicep and into the forearm.',
      'Hold, then switch arms.',
    ],
    tips: [
      'Keep the arm straight — bending the elbow reduces the stretch.',
      'This also stretches the anterior deltoid and pec minor.',
    ],
    description: 'Deeply stretches the biceps and anterior forearm using body rotation against a wall.',
  },
  {
    id: 's13',
    name: 'Overhead Tricep Stretch',
    muscleGroup: 'Arms',
    targetArea: 'Triceps Long Head',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Raise one arm overhead and bend the elbow so your hand drops behind your head.',
      'Use the opposite hand to gently press the elbow further back.',
      'Keep your upper arm close to your ear.',
      'Hold and breathe.',
    ],
    tips: [
      'Avoid forcing the elbow — gentle pressure is sufficient.',
      'This also provides a mild lat stretch.',
    ],
    description: 'Classic isolation stretch for the triceps long head through overhead elbow flexion.',
  },
  {
    id: 's14',
    name: 'Wrist Flexor Stretch',
    muscleGroup: 'Arms',
    targetArea: 'Forearm Flexors, Wrist Joint',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Extend one arm in front of you, palm facing up.',
      'Use the opposite hand to gently pull your fingers downward toward the floor.',
      'Keep the arm straight throughout.',
      'Hold and breathe.',
    ],
    tips: [
      'Essential for anyone who types heavily or performs heavy grip training.',
      'Alternate with wrist extensor stretches (palm facing down).',
    ],
    description: 'Targets the forearm flexor group to relieve wrist tension from gripping and typing.',
  },
  {
    id: 's15',
    name: 'Wrist Extensor Stretch',
    muscleGroup: 'Arms',
    targetArea: 'Forearm Extensors, Brachioradialis',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Extend one arm in front of you, palm facing down.',
      'Use the opposite hand to gently pull your fingers toward your body.',
      'Keep the arm straight — you should feel the stretch along the top of your forearm.',
      'Hold and switch sides.',
    ],
    tips: [
      'Critical for preventing lateral epicondylitis (tennis elbow).',
      'Pair with wrist circles for complete forearm mobility.',
    ],
    description: 'Stretches the forearm extensors and brachioradialis to prevent overuse injury.',
  },

  // ──────────────────────────────────────────────────────
  // LEGS (Quads, Hamstrings, Calves, Glutes, Adductors)
  // ──────────────────────────────────────────────────────
  {
    id: 's16',
    name: 'Standing Quad Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Quadriceps, Hip Flexors',
    difficulty: 'Beginner',
    holdDuration: '30 sec each leg',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Stand on one leg (use a wall for balance if needed).',
      'Bend the opposite knee and grab your ankle behind you.',
      'Pull your heel toward your glute while keeping your knees together.',
      'Push your hips slightly forward for a deeper hip flexor stretch.',
    ],
    tips: [
      'Keep your standing knee slightly bent to protect the joint.',
      'Squeeze your glute on the stretching side to intensify the hip flexor component.',
    ],
    description: 'Fundamental quad and hip flexor stretch essential after squats, lunges, and running.',
  },
  {
    id: 's17',
    name: 'Standing Hamstring Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Hamstrings, Posterior Chain',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec each leg',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Stand upright and place one heel on a low surface (bench, step, or floor).',
      'Keep both legs straight and hinge at the hips, leaning your torso forward.',
      'Reach toward your toes while maintaining a flat back.',
      'Hold when you feel a stretch along the back of your thigh.',
    ],
    tips: [
      'Hinge from the hips — do not round your lower back.',
      'A slight anterior pelvic tilt deepens the hamstring stretch.',
    ],
    description: 'Targets the hamstrings and posterior chain through hip hinge mechanics.',
  },
  {
    id: 's18',
    name: '90/90 Hip Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Hip External & Internal Rotators, Glutes, Piriformis',
    difficulty: 'Intermediate',
    holdDuration: '45-60 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Sit on the floor with your front leg bent 90° in front and back leg bent 90° behind.',
      'Both knees should be at right angles with shins flat on the floor.',
      'Sit tall and slowly lean your torso forward over the front shin.',
      'You should feel a deep stretch in the front hip and glute.',
    ],
    tips: [
      'If you cannot get the back leg flat, place a cushion under that hip.',
      'This is the gold standard hip mobility drill used by physical therapists.',
    ],
    description: 'Premier hip mobility exercise targeting both external and internal rotation simultaneously.',
  },
  {
    id: 's19',
    name: 'Pigeon Pose',
    muscleGroup: 'Legs',
    targetArea: 'Gluteus Medius, Piriformis, Hip Flexors',
    difficulty: 'Intermediate',
    holdDuration: '45-60 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'From a plank or all-fours position, bring your right knee forward behind your right wrist.',
      'Angle your right shin diagonally under your torso.',
      'Extend your left leg straight behind you, top of foot on the floor.',
      'Lower your torso over your front shin and hold — breathe deeply.',
    ],
    tips: [
      'Place a yoga block or folded towel under your front hip if it does not touch the floor.',
      'Keep your hips square — avoid rotating to one side.',
    ],
    description: 'Deep hip opener targeting the piriformis, glute med, and hip flexor of the back leg.',
  },
  {
    id: 's20',
    name: 'Wall Calf Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Gastrocnemius, Soleus',
    difficulty: 'Beginner',
    holdDuration: '30 sec each leg',
    equipment: 'Wall',
    category: 'Static',
    instructions: [
      'Face a wall and place both hands flat against it at chest height.',
      'Step one foot back 2-3 feet, keeping the heel flat on the ground.',
      'Lean into the wall, bending the front knee while keeping the back leg straight.',
      'You should feel a stretch in the calf of the back leg.',
    ],
    tips: [
      'To target the soleus, slightly bend the back knee while keeping the heel down.',
      'Press through the heel firmly to maximize the stretch.',
    ],
    description: 'Targets the gastrocnemius and soleus; essential after running, squats, and calf raises.',
  },
  {
    id: 's21',
    name: 'Butterfly / Groin Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Adductors, Inner Thigh, Hip Joint',
    difficulty: 'Beginner',
    holdDuration: '45-60 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Sit on the floor and bring the soles of your feet together in front of you.',
      'Hold your ankles and let your knees fall toward the floor.',
      'Sit tall with a straight spine and gently press your knees down with your elbows.',
      'Hold and breathe deeply.',
    ],
    tips: [
      'Sit on a folded towel if your hips are very tight.',
      'Avoid bouncing — use steady, gentle pressure.',
    ],
    description: 'Opens the inner thigh (adductor) muscles and hip joint capsule.',
  },
  {
    id: 's22',
    name: 'Couch Stretch (Rear Foot Elevated)',
    muscleGroup: 'Legs',
    targetArea: 'Hip Flexors, Rectus Femoris, Psoas',
    difficulty: 'Advanced',
    holdDuration: '60-90 sec each side',
    equipment: 'Couch or Wall',
    category: 'Static',
    instructions: [
      'Kneel with your back to a couch or wall. Place one foot up on the couch behind you.',
      'Step your front foot forward into a lunge position.',
      'Drive your hips forward while squeezing the glute of the back leg.',
      'Hold tall and breathe — this is an intense hip flexor stretch.',
    ],
    tips: [
      'This is the most effective hip flexor stretch known in rehabilitation science.',
      'Keep your core braced to avoid compensatory lumbar extension.',
    ],
    description: 'The gold-standard hip flexor and rectus femoris stretch used in physical therapy.',
  },
  {
    id: 's23',
    name: 'Figure Four (Supine Piriformis)',
    muscleGroup: 'Legs',
    targetArea: 'Piriformis, Gluteus Medius, Deep Hip Rotators',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Lie on your back with both knees bent and feet flat on the floor.',
      'Cross one ankle over the opposite knee, forming a "figure 4" shape.',
      'Reach through and pull the bottom thigh toward your chest.',
      'Keep your head and shoulders relaxed on the floor.',
    ],
    tips: [
      'Flex the foot of the crossed leg to protect the knee joint.',
      'Gently press the knee of the crossed leg away for deeper stretch.',
    ],
    description: 'Supine stretch for the piriformis and deep external hip rotators; great for sciatica relief.',
  },

  // ──────────────────────────────────────────────────────
  // CORE (Abs, Obliques, Lower Back)
  // ──────────────────────────────────────────────────────
  {
    id: 's24',
    name: 'Cobra Stretch',
    muscleGroup: 'Core',
    targetArea: 'Rectus Abdominis, Hip Flexors',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Lie face down with your palms flat on the floor under your shoulders.',
      'Press your upper body up, extending your arms while keeping your hips on the floor.',
      'Look straight ahead and elongate your spine.',
      'Hold and breathe — feel the stretch across your abs and hip flexors.',
    ],
    tips: [
      'Keep your glutes relaxed; the stretch should come from spinal extension, not hip extension.',
      'Only extend as far as is comfortable — no lower back pain.',
    ],
    description: 'Classic spinal extension stretch that opens the abdominals and hip flexors.',
  },
  {
    id: 's25',
    name: 'Standing Side Bend',
    muscleGroup: 'Core',
    targetArea: 'Obliques, Quadratus Lumborum, Intercostals',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Raise one arm overhead and lean to the opposite side.',
      'Keep both feet flat and hips level — do not rotate.',
      'Hold and breathe into the stretched side of your ribcage.',
    ],
    tips: [
      'This stretch targets the often-neglected quadratus lumborum (QL).',
      'Avoid leaning forward or backward — keep the bend strictly lateral.',
    ],
    description: 'Lateral flexion stretch for obliques, QL, and intercostal muscles.',
  },
  {
    id: 's26',
    name: 'Supine Knee-to-Chest',
    muscleGroup: 'Core',
    targetArea: 'Lower Back (Erector Spinae), Glutes',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec each leg',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Lie on your back with both legs extended.',
      'Pull one knee toward your chest, clasping both hands around the shin.',
      'Keep the opposite leg flat on the floor (or bent for comfort).',
      'Hold and gently rock side to side for a lower back massage.',
    ],
    tips: [
      'Pull both knees to your chest simultaneously for a full lower back release.',
      'Excellent first thing in the morning or after prolonged sitting.',
    ],
    description: 'Gentle lower back and glute stretch that decompresses the lumbar spine.',
  },
  {
    id: 's27',
    name: 'Scorpion Stretch',
    muscleGroup: 'Core',
    targetArea: 'Hip Flexors, Obliques, Thoracic Spine',
    difficulty: 'Advanced',
    holdDuration: '8-10 reps alternating',
    equipment: 'None',
    category: 'Dynamic',
    instructions: [
      'Lie face down with arms extended to the sides in a T-position.',
      'Lift one foot off the ground, bending the knee.',
      'Rotate your hip and try to touch that foot to the opposite hand.',
      'Return to start and repeat on the other side.',
    ],
    tips: [
      'Keep both shoulders pressed firmly into the ground.',
      'This combines hip flexor stretch with thoracic rotation.',
    ],
    description: 'Dynamic rotational stretch combining hip flexor opening with thoracic spine mobilization.',
  },

  // ──────────────────────────────────────────────────────
  // NECK & UPPER TRAPS
  // ──────────────────────────────────────────────────────
  {
    id: 's28',
    name: 'Lateral Neck Flexion Stretch',
    muscleGroup: 'Shoulders',
    targetArea: 'Upper Trapezius, Levator Scapulae, SCM',
    difficulty: 'Beginner',
    holdDuration: '20-30 sec each side',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Sit or stand tall with shoulders relaxed.',
      'Gently tilt your ear toward the same-side shoulder.',
      'Place the same-side hand on top of your head and apply very gentle pressure.',
      'Keep the opposite shoulder pressed down.',
    ],
    tips: [
      'Never yank or force the neck — use minimal hand pressure.',
      'Look slightly downward and diagonally to target the levator scapulae specifically.',
    ],
    description: 'Targets the upper trapezius, levator scapulae, and SCM — essential for desk workers.',
  },
  {
    id: 's29',
    name: 'Chin Tuck (Deep Neck Flexor Activation)',
    muscleGroup: 'Shoulders',
    targetArea: 'Suboccipitals, Deep Cervical Flexors',
    difficulty: 'Beginner',
    holdDuration: '10 reps x 5 sec holds',
    equipment: 'None',
    category: 'Active',
    instructions: [
      'Sit or stand with your back against a wall.',
      'Gently draw your chin straight back (making a "double chin").',
      'Hold for 5 seconds at end range, then release.',
      'Repeat for the prescribed number of reps.',
    ],
    tips: [
      'This is both a stretch for the suboccipitals and a strengthener for deep neck flexors.',
      'Essential corrective exercise for forward head posture.',
    ],
    description: 'Corrective exercise for forward head posture that stretches suboccipitals and activates deep cervical flexors.',
  },

  // ──────────────────────────────────────────────────────
  // FULL BODY / COMPOUND STRETCHES
  // ──────────────────────────────────────────────────────
  {
    id: 's30',
    name: 'World\'s Greatest Stretch',
    muscleGroup: 'Legs',
    targetArea: 'Hip Flexors, Thoracic Spine, Hamstrings, Groin',
    difficulty: 'Intermediate',
    holdDuration: '5-6 reps each side',
    equipment: 'None',
    category: 'Dynamic',
    instructions: [
      'Step into a deep lunge with your right foot forward.',
      'Place your left hand on the ground inside your right foot.',
      'Rotate your torso to the right and reach your right arm toward the ceiling.',
      'Return your hand to the ground, then straighten your front leg to stretch the hamstring.',
      'Step back and repeat on the other side.',
    ],
    tips: [
      'This is the single best dynamic warm-up stretch used by professional athletes.',
      'Combine hip flexor opening, thoracic rotation, hamstring stretch, and groin mobility in one movement.',
    ],
    description: 'The ultimate compound dynamic stretch combining hip, thoracic, hamstring, and groin mobility in one flow.',
  },
  {
    id: 's31',
    name: 'Downward Dog',
    muscleGroup: 'Back',
    targetArea: 'Calves, Hamstrings, Shoulders, Lats, Spine',
    difficulty: 'Beginner',
    holdDuration: '30-45 sec',
    equipment: 'None',
    category: 'Static',
    instructions: [
      'Start in a plank position with hands shoulder-width apart.',
      'Push your hips up and back, forming an inverted V-shape with your body.',
      'Press your heels toward the floor and your chest toward your thighs.',
      'Keep arms straight and head between your biceps.',
    ],
    tips: [
      'Pedal your feet (alternate bending each knee) for a dynamic calf warm-up.',
      'Focus on lengthening the spine rather than touching heels to the ground.',
    ],
    description: 'Foundational yoga pose that stretches the entire posterior chain, shoulders, and decompresses the spine.',
  },
  {
    id: 's32',
    name: 'Foam Roller Thoracic Extension',
    muscleGroup: 'Back',
    targetArea: 'Thoracic Spine, Rhomboids, Pec Minor',
    difficulty: 'Intermediate',
    holdDuration: '60-90 sec (or 10-15 rolls)',
    equipment: 'Foam Roller',
    category: 'Static',
    instructions: [
      'Place a foam roller horizontally across your mid-back and lie back on it.',
      'Support your head with your hands and keep your hips on the ground.',
      'Gently arch backward over the roller, then roll up and down the thoracic spine.',
      'Pause on tight spots for 10-15 seconds.',
    ],
    tips: [
      'Stay in the thoracic region (mid-back) — avoid rolling the lower back.',
      'Cross your arms over your chest for a deeper extension stretch.',
    ],
    description: 'Self-myofascial release and extension stretch for the thoracic spine; combats desk posture kyphosis.',
  },
  // ──────────────────────────────────────────────────────
  // PNF (PROPRIOCEPTIVE NEUROMUSCULAR FACILITATION)
  // ──────────────────────────────────────────────────────
  {
    id: 's33',
    name: 'PNF Hamstring Contract-Relax',
    muscleGroup: 'Legs',
    targetArea: 'Biceps Femoris, Semitendinosus, Semimembranosus',
    difficulty: 'Intermediate',
    holdDuration: '3 cycles (10s stretch + 6s contract + 30s deep stretch)',
    equipment: 'Resistance Band / Towel',
    category: 'PNF',
    instructions: [
      'Lie supine on a mat, loop a resistance band or towel around the ball of one foot, and extend the leg upward.',
      'Phase 1 (Passive Stretch): Pull the leg gently until feeling mild tension; hold for 10 seconds.',
      'Phase 2 (Isometric Contraction): Push your heel firmly down into the band/towel against resistance for 6 seconds at ~30-50% max effort (do not let leg move).',
      'Phase 3 (Deeper Stretch): Exhale, relax the hamstring completely, and gently pull the leg deeper into the stretch for 30 seconds.',
      'Repeat 2-3 cycles per leg.',
    ],
    tips: [
      'Never contract at 100% force — autogenic inhibition via Golgi tendon organs only requires 20-50% effort.',
      'Keep the resting opposite leg flat on the ground to stabilize pelvis.',
    ],
    description: 'Clinical PNF contract-relax technique for rapid hamstring range-of-motion expansion via Golgi tendon organ inhibition.',
  },
  {
    id: 's34',
    name: 'PNF Doorway Chest Contract-Relax',
    muscleGroup: 'Chest',
    targetArea: 'Pectoralis Major, Pectoralis Minor, Anterior Deltoid',
    difficulty: 'Intermediate',
    holdDuration: '3 cycles (10s stretch + 6s contract + 30s deep stretch)',
    equipment: 'Doorway / Sturdy Post',
    category: 'PNF',
    instructions: [
      'Position your forearm against a doorway jamb with elbow bent at 90 degrees.',
      'Step forward into a gentle passive chest stretch; hold for 10 seconds.',
      'Contract your chest muscles by pressing your forearm forward into the door frame for 6 seconds without moving your body.',
      'Relax your chest entirely, inhale, and on the exhale step slightly further forward into a new end-range stretch for 30 seconds.',
    ],
    tips: [
      'Keep your ribcage down and avoid hyperextending your lumbar spine during the contraction.',
      'Breathe rhythmically during the isometric contraction phase.',
    ],
    description: 'PNF chest mobilization that unlocks tight anterior shoulder capsules and tight pecs caused by bench pressing.',
  },
  {
    id: 's35',
    name: 'PNF Couch / Hip Flexor Contract-Relax',
    muscleGroup: 'Legs',
    targetArea: 'Psoas Major, Rectus Femoris (Hip Flexors & Quads)',
    difficulty: 'Advanced',
    holdDuration: '3 cycles per leg',
    equipment: 'Wall or Bench + Mat',
    category: 'PNF',
    instructions: [
      'Enter a half-kneeling couch stretch with your back shin against a wall or bench and front knee at 90 degrees.',
      'Hold a tall upright posture for 10 seconds in a mild passive stretch.',
      'Drive your rear knee and top of foot firmly down into the mat/wall for 6 seconds as if trying to kick forward.',
      'Relax completely, squeeze the glute on the rear leg, and sink the hips 1-2 inches forward and down for 30 seconds.',
    ],
    tips: [
      'Posterior pelvic tilt (tucking pelvis under) is crucial to isolate the psoas and rectus femoris.',
      'Do not allow lower back to excessively arch during the active contract phase.',
    ],
    description: 'Advanced PNF hip mobility protocol designed to dissolve anterior pelvic tilt and restore hip extension.',
  },
  {
    id: 's36',
    name: 'PNF Lat & Shoulder Contract-Relax',
    muscleGroup: 'Back',
    targetArea: 'Latissimus Dorsi, Teres Major, Posterior Capsule',
    difficulty: 'Intermediate',
    holdDuration: '3 cycles per side',
    equipment: 'Sturdy Post / Barbell in Rack',
    category: 'PNF',
    instructions: [
      'Grip a sturdy upright bar or doorframe at hip height with one hand, sit hips back, and let the lat stretch for 10 seconds.',
      'Pull your arm down and toward your hip against the immovable bar for 6 seconds, engaging the lat.',
      'Relax the lat, exhale, sink your hips farther back, and rotate your torso slightly inward for 30 seconds of deeper stretch.',
    ],
    tips: [
      'Focus the mental cue on your armpit and side ribcage rather than pulling with the arm muscles.',
      'Keep shoulders square before initiating the contract phase.',
    ],
    description: 'PNF technique for latissimus dorsi flexibility, unlocking overhead shoulder flexion for overhead presses and pull-ups.',
  },
  // ──────────────────────────────────────────────────────
  // ACTIVE & DYNAMIC MOBILITY
  // ──────────────────────────────────────────────────────
  {
    id: 's37',
    name: 'Active 90/90 Hip Mobility Flow',
    muscleGroup: 'Legs',
    targetArea: 'Hip Internal & External Rotators, Glute Medius, Piriformis',
    difficulty: 'Intermediate',
    holdDuration: '8-10 slow reps per side',
    equipment: 'None',
    category: 'Active',
    instructions: [
      'Sit on the floor with both knees bent at 90 degrees — one leg in front (external rotation), one leg to the side (internal rotation).',
      'Keep tall posture with minimal reliance on hands behind you.',
      'Actively lift and rotate your knees across to the opposite side while keeping your heels glued to the floor.',
      'Pause for 2-3 seconds at each side before transitioning back.',
    ],
    tips: [
      'Try performing without hands on the ground for maximum active joint control.',
      'If your hips lift excessively, place hands behind you for support.',
    ],
    description: 'Active dynamic hip flow that enhances internal and external hip rotation essential for deep, pain-free squats.',
  },
  {
    id: 's38',
    name: 'Active Jefferson Curl Spinal Wave',
    muscleGroup: 'Back',
    targetArea: 'Erector Spinae, Hamstrings, Thoracolumbar Fascia',
    difficulty: 'Advanced',
    holdDuration: '5-8 slow segmented reps',
    equipment: 'Light Weight (2-5 kg) or Bodyweight',
    category: 'Active',
    instructions: [
      'Stand tall on an elevated surface or flat ground with feet hip-width apart.',
      'Tuck your chin to your chest, then round your upper back, mid-back, and lower back one vertebra at a time.',
      'Let your arms hang relaxed with a light weight, feeling segmental articulation through the entire spine down to end range.',
      'Pause at maximum comfortable flexion for 2 seconds, then slowly reverse the roll from lumbar to cervical spine.',
    ],
    tips: [
      'Use extremely light weight or bodyweight only to condition spinal ligaments and posterior fascia.',
      'Move slowly with continuous deep abdominal breathing.',
    ],
    description: 'Gymnastic conditioning mobility exercise that develops segmental spinal flexion control and hamstring flexibility.',
  },
];

/**
 * Get stretches for a specific muscle group.
 */
export function getStretchesForMuscleGroup(muscleGroup: string): Stretch[] {
  return stretches.filter(
    (s) => s.muscleGroup.toLowerCase() === muscleGroup.toLowerCase()
  );
}

/**
 * Get all unique muscle groups that have stretches.
 */
export function getStretchMuscleGroups(): string[] {
  const groups = new Set(stretches.map((s) => s.muscleGroup));
  return Array.from(groups).sort();
}
