(() => {
  const groups = [
    ['Chest','Dumbbell','weight_reps',['Dumbbell Bench Press','Incline Dumbbell Press','Decline Dumbbell Press','Dumbbell Fly','Incline Dumbbell Fly','Dumbbell Around the World','Dumbbell Squeeze Press','Single-Arm Dumbbell Press']],
    ['Chest','Barbell','weight_reps',['Barbell Bench Press','Incline Barbell Bench Press','Decline Barbell Bench Press','Close-Grip Bench Press','Floor Press','Spoto Press','Pause Bench Press','Guillotine Press']],
    ['Chest','Machine','weight_reps',['Machine Chest Press','Incline Machine Press','Decline Machine Press','Pec Deck','Cable Crossover','Low Cable Fly','High Cable Fly','Single-Arm Cable Press']],
    ['Chest','Bodyweight','reps',['Push-Up','Incline Push-Up','Decline Push-Up','Knee Push-Up','Diamond Push-Up','Wide Push-Up','Archer Push-Up','Chest Dip']],
    ['Back','Barbell','weight_reps',['Barbell Row','Pendlay Row','T-Bar Row','Meadows Row','Seal Row','Barbell Pullover','Barbell Shrug','Rack Pull']],
    ['Back','Dumbbell','weight_reps',['One-Arm Dumbbell Row','Chest-Supported Dumbbell Row','Dumbbell Row','Renegade Row','Dumbbell Pullover','Dumbbell Shrug','Incline Bench Row','Tripod Row']],
    ['Back','Cable','weight_reps',['Lat Pulldown','Close-Grip Pulldown','Straight-Arm Pulldown','Seated Cable Row','Wide-Grip Cable Row','Face Pull','Cable Shrug','Single-Arm Cable Row']],
    ['Back','Bodyweight','reps',['Pull-Up','Chin-Up','Neutral-Grip Pull-Up','Assisted Pull-Up','Inverted Row','Scapular Pull-Up','Superman','Reverse Snow Angel']],
    ['Shoulders','Dumbbell','weight_reps',['Seated Dumbbell Shoulder Press','Arnold Press','Dumbbell Lateral Raise','Front Raise','Rear Delt Fly','Cuban Press','Lean-Away Lateral Raise','Dumbbell Y-Raise']],
    ['Shoulders','Barbell','weight_reps',['Standing Overhead Press','Seated Barbell Press','Push Press','Behind-the-Neck Press','Bradford Press','Barbell Front Raise','Upright Row','Landmine Press']],
    ['Shoulders','Cable','weight_reps',['Cable Lateral Raise','Cable Front Raise','Cable Rear Delt Fly','Cable Upright Row','Cable Y-Raise','Reverse Cable Fly','Rope Face Pull','Cable Shoulder Press']],
    ['Biceps','Dumbbell','weight_reps',['Dumbbell Curl','Hammer Curl','Incline Dumbbell Curl','Concentration Curl','Preacher Curl','Zottman Curl','Spider Curl','Cross-Body Curl']],
    ['Biceps','Barbell','weight_reps',['Barbell Curl','EZ-Bar Curl','Reverse Curl','Drag Curl','Barbell Preacher Curl','Wide-Grip Curl','Close-Grip Curl','21s Curl']],
    ['Biceps','Cable','weight_reps',['Cable Curl','Rope Hammer Curl','Bayesian Cable Curl','High Cable Curl','Cable Preacher Curl','Reverse Cable Curl','Single-Arm Cable Curl','Lying Cable Curl']],
    ['Triceps','Dumbbell','weight_reps',['Overhead Dumbbell Extension','Dumbbell Skull Crusher','Dumbbell Kickback','Tate Press','JM Dumbbell Press','Single-Arm Extension','Rolling Triceps Extension','Close-Grip Dumbbell Press']],
    ['Triceps','Cable','weight_reps',['Rope Triceps Pushdown','Straight-Bar Pushdown','Overhead Cable Extension','Single-Arm Pushdown','Reverse-Grip Pushdown','Cross-Body Extension','One-Arm Cable Kickback','Kneeling Cable Extension']],
    ['Quadriceps','Barbell','weight_reps',['Back Squat','Front Squat','Zercher Squat','Pause Squat','Box Squat','Hack Squat','Barbell Split Squat','Sissy Squat']],
    ['Quadriceps','Dumbbell','weight_reps',['Goblet Squat','Bulgarian Split Squat','Dumbbell Lunge','Reverse Lunge','Walking Lunge','Dumbbell Step-Up','Cyclist Squat','Dumbbell Front Squat']],
    ['Quadriceps','Machine','weight_reps',['Leg Press','Hack Squat Machine','Leg Extension','Smith Machine Squat','Pendulum Squat','Belt Squat','Single-Leg Press','V-Squat']],
    ['Quadriceps','Bodyweight','reps',['Bodyweight Squat','Chair Squat','Wall Sit','Split Squat','Jumping Lunge','Lateral Lunge','Pistol Squat','Squat to Calf Raise']],
    ['Hamstrings','Barbell','weight_reps',['Romanian Deadlift','Stiff-Leg Deadlift','Conventional Deadlift','Sumo Deadlift','Good Morning','Snatch-Grip Deadlift','Deficit Deadlift','Barbell Hip Hinge']],
    ['Hamstrings','Machine','weight_reps',['Lying Leg Curl','Seated Leg Curl','Standing Leg Curl','Glute-Ham Raise','Nordic Curl','Cable Pull-Through','Reverse Hyperextension','Back Extension']],
    ['Glutes','Mixed','weight_reps',['Barbell Hip Thrust','Dumbbell Hip Thrust','Cable Kickback','Glute Bridge','Single-Leg Glute Bridge','Frog Pump','Cable Abduction','Step-Up']],
    ['Calves','Mixed','weight_reps',['Standing Calf Raise','Seated Calf Raise','Leg Press Calf Raise','Donkey Calf Raise','Single-Leg Calf Raise','Smith Calf Raise','Tibialis Raise','Jump Rope Calf Bounce']],
    ['Core','Bodyweight','reps',['Crunch','Reverse Crunch','Bicycle Crunch','Hanging Knee Raise','Hanging Leg Raise','V-Up','Dead Bug','Bird Dog']],
    ['Core','Bodyweight','duration',['Plank','Side Plank','Hollow Hold','Boat Hold','Bear Plank','Reverse Plank','Wall Plank','RKC Plank']],
    ['Core','Cable','weight_reps',['Cable Crunch','Pallof Press','Wood Chop','Cable Rotation','Landmine Rotation','Ab Wheel Rollout','Suitcase Carry','Farmer Carry']],
    ['Full Body','Kettlebell','weight_reps',['Kettlebell Swing','Kettlebell Clean','Kettlebell Snatch','Kettlebell Goblet Squat','Turkish Get-Up','Kettlebell Press','Kettlebell High Pull','Kettlebell Thruster']],
    ['Full Body','Barbell','weight_reps',['Power Clean','Hang Clean','Clean and Jerk','Power Snatch','Hang Snatch','Barbell Thruster','Clean Pull','Snatch Pull']],
    ['Conditioning','Bodyweight','reps',['Burpee','Mountain Climber','Jump Squat','Jumping Jack','Skater Jump','High Knees','Bear Crawl','Crab Walk']],
    ['Cardio','Cardio Machine','distance_time',['Treadmill Run','Outdoor Run','Stationary Bike','Outdoor Cycling','Rowing Machine','Elliptical','Stair Climber','SkiErg']],
    ['Cardio','Mixed','duration',['Jump Rope','Battle Ropes','Shadow Boxing','Swimming','Hiking','Sled Push','Sled Pull','Rucking']],
    ['Mobility','Bodyweight','duration',['Cat-Cow','World’s Greatest Stretch','90/90 Hip Switch','Couch Stretch','Child’s Pose','Thoracic Rotation','Ankle Dorsiflexion Stretch','Doorway Chest Stretch']],
    ['Mobility','Band','reps',['Band Pull-Apart','Band Dislocate','Banded Face Pull','Clamshell','Lateral Band Walk','Monster Walk','Banded External Rotation','Banded Good Morning']],
    ['Balance','Bodyweight','duration',['Single-Leg Balance','Single-Leg Reach','Heel-to-Toe Walk','Standing Knee Raise Hold','Warrior III Hold','Tree Pose','Single-Leg Clock Reach','Balance Pad Stand']]
    ,['Full Body','Crunch Machines','weight_reps',['Assisted Pull-Up Machine','Assisted Dip Machine','Plate-Loaded Chest Press','Plate-Loaded Row','Iso-Lateral Pulldown','Booty Builder Hip Thrust','Glute Drive Machine','Rotary Torso Machine']]
    ,['Glutes','Crunch Machines','weight_reps',['Hip Abductor Machine','Hip Adductor Machine','Standing Glute Kickback Machine','Plate-Loaded Glute Bridge','Cable Hip Abduction','Cable Hip Adduction','Multi-Hip Machine','Reverse Hyper Machine']]
    ,['Conditioning','HIITZone','reps',['Box Jump','Medicine Ball Slam','Wall Ball Shot','TRX Row','TRX Chest Press','TRX Fallout','Sandbag Clean','Battle Rope Slam']]
    ,['Cardio','Cardio Machine','distance_time',['Assault Bike','Recumbent Bike','Woodway Treadmill','Spin Bike','StepMill','Arc Trainer','Air Rower','Incline Treadmill Walk']]
  ];

  const patternFor = (name, muscle) => {
    const n = name.toLowerCase();
    if (/run|bike|row|elliptical|stair|swim|hiking|ruck/.test(n)) return 'Locomotion';
    if (/deadlift|hinge|swing|good morning|pull-through/.test(n)) return 'Hip hinge';
    if (/squat|press|lunge|step-up/.test(n) && ['Quadriceps','Glutes'].includes(muscle)) return 'Squat / lunge';
    if (/row|pull-up|pulldown/.test(n)) return 'Pull';
    if (/press|push-up|dip/.test(n)) return 'Push';
    if (/plank|hold|pallof/.test(n)) return 'Stability / isometric';
    if (muscle === 'Mobility') return 'Mobility';
    return 'Isolation / accessory';
  };
  const cuesFor = (pattern) => ({
    'Push':'Set the shoulders down and back. Brace the torso, use a controlled lowering phase, and press without bouncing.',
    'Pull':'Brace your torso. Lead with the elbows, keep the shoulders away from the ears, and control the return.',
    'Hip hinge':'Brace before moving. Push the hips back, keep the load close, and finish tall without overextending.',
    'Squat / lunge':'Keep a stable foot, brace the trunk, track knees with toes, and use a comfortable pain-free depth.',
    'Locomotion':'Begin at an easy pace, keep breathing controlled, and increase speed or resistance gradually.',
    'Stability / isometric':'Breathe behind a firm brace. Hold a neutral position and stop when alignment breaks.',
    'Mobility':'Move slowly into a mild stretch, never force range, and breathe normally.',
    'Isolation / accessory':'Stabilize the working joint, use a smooth full range you can control, and avoid momentum.'
  }[pattern]);

  let i = 0;
  const exercises = groups.flatMap(([muscle,equipment,tracking,names]) => names.map(name => {
    const pattern = patternFor(name,muscle);
    return { id:`ex-${++i}`, name, muscle, secondary:[], equipment, tracking, pattern, difficulty:'All levels', custom:false,
      instructions:cuesFor(pattern), rest: tracking === 'duration' ? 45 : 90,
      caution:'Use a load and range you can control. Stop for sharp pain, severe dizziness, chest pressure, or unusual shortness of breath.' };
  }));

  const find = name => exercises.find(x => x.name === name)?.id;
  const item = (name, sets=3, reps=10, rest=90) => ({ exerciseId:find(name), sets, reps, rest });
  const routines = [
    {id:'routine-full-a',name:'Beginner Full Body A',tag:'Beginner • 45–60 min',items:[item('Goblet Squat',3,10),item('Dumbbell Bench Press',3,10),item('Lat Pulldown',3,10),item('Romanian Deadlift',3,10),item('Seated Dumbbell Shoulder Press',2,12,75),item('Plank',3,40,45)]},
    {id:'routine-full-b',name:'Beginner Full Body B',tag:'Beginner • 45–60 min',items:[item('Leg Press',3,12),item('One-Arm Dumbbell Row',3,10,75),item('Incline Dumbbell Press',3,10),item('Barbell Hip Thrust',3,12),item('Dumbbell Lateral Raise',2,15,60),item('Dead Bug',3,10,45)]},
    {id:'routine-push',name:'Push Day',tag:'PPL • Chest, shoulders, triceps',items:[item('Barbell Bench Press',4,6,150),item('Incline Dumbbell Press',3,10),item('Seated Dumbbell Shoulder Press',3,8,120),item('Pec Deck',3,12,60),item('Dumbbell Lateral Raise',3,15,60),item('Rope Triceps Pushdown',3,12,60)]},
    {id:'routine-pull',name:'Pull Day',tag:'PPL • Back and biceps',items:[item('Pull-Up',4,8,120),item('Barbell Row',3,8,120),item('Seated Cable Row',3,10),item('Face Pull',3,15,60),item('EZ-Bar Curl',3,10,60),item('Hammer Curl',2,12,60)]},
    {id:'routine-legs',name:'Leg Day',tag:'PPL • Quads, glutes, hamstrings',items:[item('Back Squat',4,6,180),item('Romanian Deadlift',3,8,150),item('Leg Press',3,12,120),item('Lying Leg Curl',3,12,75),item('Leg Extension',3,15,60),item('Standing Calf Raise',4,12,60)]},
    {id:'routine-home',name:'Home — No Equipment',tag:'Bodyweight • 25–40 min',items:[item('Bodyweight Squat',4,15,60),item('Push-Up',4,10,60),item('Reverse Lunge',3,10,60),item('Glute Bridge',3,15,45),item('Mountain Climber',3,30,45),item('Plank',3,40,45)]},
    {id:'routine-strength',name:'Strength Foundation',tag:'Intermediate • 60–75 min',items:[item('Back Squat',5,5,180),item('Barbell Bench Press',5,5,180),item('Barbell Row',4,8,120),item('Romanian Deadlift',3,8,150),item('Pallof Press',3,12,60)]},
    {id:'routine-conditioning',name:'Conditioning Circuit',tag:'All levels • 20–30 min',items:[item('Burpee',3,10,60),item('Kettlebell Swing',3,15,60),item('Mountain Climber',3,30,45),item('Jump Squat',3,12,60),item('Farmer Carry',3,40,75)]}
    ,{id:'routine-crunch-full',name:'Crunch Full Body',tag:'Crunch Fitness • Machines + free weights',items:[item('Leg Press',3,12,90),item('Plate-Loaded Chest Press',3,10,90),item('Lat Pulldown',3,10,90),item('Seated Leg Curl',3,12,75),item('Seated Dumbbell Shoulder Press',3,10,75),item('Cable Crunch',3,12,60)]}
    ,{id:'routine-crunch-upper',name:'Crunch Upper Body',tag:'Crunch Fitness • 45–60 min',items:[item('Barbell Bench Press',4,6,150),item('Assisted Pull-Up Machine',3,10,90),item('Plate-Loaded Row',3,10,90),item('Cable Shoulder Press',3,10,75),item('Rope Triceps Pushdown',3,12,60),item('Cable Curl',3,12,60)]}
    ,{id:'routine-crunch-lower',name:'Crunch Lower Body',tag:'Crunch Fitness • Platforms + machines',items:[item('Back Squat',4,6,180),item('Romanian Deadlift',3,8,150),item('Booty Builder Hip Thrust',3,10,90),item('Leg Extension',3,12,75),item('Seated Leg Curl',3,12,75),item('Standing Calf Raise',4,12,60)]}
    ,{id:'routine-crunch-hiit',name:'Crunch HIITZone Circuit',tag:'Crunch Fitness • Sled, ropes, TRX',items:[item('Sled Push',4,30,75),item('Battle Rope Slam',4,20,45),item('Box Jump',3,10,60),item('TRX Row',3,12,45),item('Medicine Ball Slam',3,12,45),item('Farmer Carry',3,40,60)]}
    ,{id:'routine-crunch-cardio',name:'Crunch Cardio Mix',tag:'Crunch Fitness • 30–40 min',items:[item('Incline Treadmill Walk',1,600,60),item('Air Rower',1,600,60),item('Stair Climber',1,600,60)]}
  ];
  const crunchEquipment=['Dumbbells and free weights','Olympic barbells and bumper plates','Flat and adjustable benches','Squat racks and power cages','Olympic and deadlift platforms','Selectorized resistance machines','Plate-loaded strength machines','Cable stations','Assisted pull-up and dip machines','Kettlebells','Treadmills','Ellipticals and Arc Trainers','Stair climbers and StepMills','Stationary and spin bikes','Rowing machines','Battle ropes','Weighted sleds','Plyometric boxes','Medicine and slam balls','TRX suspension trainers','Resistance bands','HIITZone functional-training area'];
  window.REPFORGE_DATA = { exercises, routines, crunchEquipment };
})();
