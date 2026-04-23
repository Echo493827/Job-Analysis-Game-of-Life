// ════════════════════════════════════════════════════════
//  The Job Analysis Game of Life — JavaScript v4
// ════════════════════════════════════════════════════════

// ------------------------------
// DATA
// ------------------------------
const JOBS = ["Astronaut", "Server", "Software Engineer", "Trauma Surgeon"];

const ROUND1_SCORING = { 1: 10000, 2: 15000, 3: 20000 };
const ROUND1_EXPLANATIONS = {
  "Job Description": "Job descriptions provide an initial overview of tasks and requirements, but may be outdated or incomplete.",
  "Prior JA": "Previous job analyses offer validated data and save time, making them highly valuable starting points.",
  "O*NET": "O*NET provides standardized occupational information based on extensive research, offering reliable baseline data."
};

const ROUND2 = {
  "Astronaut":         { O:5, I:20, F:10, OI:10, OF:10, IF:10, OIF:5 },
  "Server":            { O:5, I:5,  F:5,  OI:10, OF:20, IF:10, OIF:10 },
  "Software Engineer": { O:5, I:10, F:10, OI:10, OF:10, IF:20, OIF:10 },
  "Trauma Surgeon":    { O:10, I:10, F:5,  OI:20, OF:10, IF:10, OIF:5 }
};
const ROUND2_EXPLANATIONS = {
  "Astronaut":         { best: "I (Interview)", explanation: "Interviews are crucial for astronauts because much of their work is specialized and cannot be easily observed." },
  "Server":            { best: "OF (Observation + Focus Group)", explanation: "Servers benefit from observation to capture real-time customer interactions, combined with focus groups to understand team dynamics." },
  "Software Engineer": { best: "IF (Interview + Focus Group)", explanation: "Software engineering combines individual problem-solving (captured via interviews) with collaborative work (understood through focus groups)." },
  "Trauma Surgeon":    { best: "OI (Observation + Interview)", explanation: "Trauma surgeons need both observation of procedural skills and interviews to understand critical decision-making under pressure." }
};

const ROUND35 = {
  "F+I":20000, "F+I+NE":20000, "F+NE":10000, "I+NE":10000,
  "F+I+ENJ":10000, "F+NE+ENJ":10000, "I+NE+ENJ":10000,
  "F+ENJ":5000, "I+ENJ":5000, "F":5000, "I":5000,
  "F+I+NE+ENJ":0, "NE+ENJ":0, "ENJ":0, "NE":0
};
const SCALE_EXPLANATIONS = { "F": "Frequency", "I": "Importance", "NE": "Needed at Entry", "ENJ": "Enjoyment" };
const ROUND35_EXPLANATION = "The best combinations are F+I (Frequency and Importance) because they tell you both how often a task occurs AND how critical it is.";

// ──────────────────────────────────────────────────
// ROUND 3 — TASK STATEMENT IDENTIFICATION DATA
// (from Linkage_Table_Answer_Key.xlsx)
// ──────────────────────────────────────────────────
const TASK_STATEMENTS = {
  "Astronaut": [
    "Work as part of a flight team with other crew members, especially during takeoffs and landings.",
    "Start engines, operate controls, and pilot spacecraft, adhering to flight plans, regulations, and procedures.",
    "Communicate with mission control for takeoff clearances, arrival instructions, and other information, using radio equipment.",
    "Exercise daily to maintain physical abilities in and out of missions.",
    "Respond to and report in-flight emergencies and malfunctions.",
    "Steer spacecraft along planned routes, using appropriate flight management systems.",
    "Monitor, maintain, and repair functioning of spacecraft equipment and systems during missions.",
    "Conduct scientific experiments in space in a specific specialty domain.",
    "Perform spacewalks in a spacesuit using safety tethers and necessary tools in order to test or repair equipment.",
    "Capture and dock unpiloted spacecraft that deliver science payloads and cargo to the space station using a robotic arm."
  ],
  "Server": [
    "Take orders from patrons for food or beverages.",
    "Check with customers to ensure that they are enjoying their meals and take action to correct any problems.",
    "Check patrons' identification to ensure that they meet minimum age requirements for consumption of alcoholic beverages.",
    "Collect payments from customers.",
    "Write patrons' food orders on order slips, memorize orders, or enter orders into computers for transmittal to kitchen staff.",
    "Prepare tables for meals, including setting up items such as linens, silverware, and glassware.",
    "Present menus to patrons and answer questions about menu items, making recommendations upon request.",
    "Remove dishes and glasses from tables or counters and take them to the kitchen for cleaning.",
    "Serve food or beverages to patrons, and prepare or serve specialty dishes at tables as required.",
    "Explain how various menu items are prepared, describing ingredients and cooking methods."
  ],
  "Software Engineer": [
    "Modify existing software to correct errors, to adapt it to new hardware, or to upgrade interfaces and improve performance.",
    "Develop or direct software system testing or validation procedures.",
    "Direct software programming and development of documentation.",
    "Consult with customers or other departments on project status.",
    "Analyze information to determine, recommend, and plan installation of a new system or modification of an existing system.",
    "Consult with engineering staff to evaluate interface between hardware and software, develop specifications and performance requirements, or resolve customer problems.",
    "Design or develop software systems, using scientific analysis and mathematical models to predict and measure outcomes and consequences of design.",
    "Prepare reports or correspondence concerning project specifications, activities, or status.",
    "Consult with data processing or project managers to obtain information on limitations or capabilities for data processing projects.",
    "Store, retrieve, and manipulate data for analysis of system capabilities and requirements."
  ],
  "Trauma Surgeon": [
    "Follow established surgical techniques during the operation.",
    "Examine patient to obtain information on medical condition and surgical risk.",
    "Operate on patients to correct deformities, repair injuries, prevent and treat diseases, or improve or restore patients' functions.",
    "Analyze patient's medical history, medication allergies, physical condition, and examination results to verify operation's necessity and to determine best procedure.",
    "Prescribe preoperative and postoperative treatments and procedures, such as sedatives, diets, antibiotics, or preparation and treatment of the patient's operative area.",
    "Diagnose bodily disorders and orthopedic conditions and provide treatments, such as medicines and surgeries, in clinics, hospital wards, or operating rooms.",
    "Provide consultation and surgical assistance to other physicians and surgeons.",
    "Direct and coordinate activities of nurses, assistants, specialists, residents, and other medical staff.",
    "Refer patient to medical specialist or other practitioners when necessary.",
    "Manage surgery services, including planning, scheduling and coordination, determination of procedures, or procurement of supplies and equipment."
  ]
};

// poorly written task statements that violate task statement rules
// each has a "flaw" explanation
const BAD_TASK_STATEMENTS = {
  "Astronaut": [
    { text: "Do space stuff regularly.", flaw: "Too vague — no specific action verb, no object, no tools/methods, no purpose." },
    { text: "Be brave and courageous in space.", flaw: "Describes a trait, not a task. Task statements need an action verb and observable behavior." },
    { text: "Rocket things.", flaw: "No clear action verb, no object, no context or purpose." },
    { text: "Help with missions.", flaw: "Too vague — 'help' is not specific, no object, tools, or purpose described." },
    { text: "Know about physics.", flaw: "Describes knowledge, not a task. Tasks describe actions performed on the job." }
  ],
  "Server": [
    { text: "Be nice to people.", flaw: "Describes a trait, not a task. Task statements need an action verb and observable behavior." },
    { text: "Do restaurant work.", flaw: "Too vague — no specific action verb, no object, no tools/methods." },
    { text: "Handle food.", flaw: "Too vague — no purpose, no tools/methods, no specific context." },
    { text: "Have good communication skills.", flaw: "Describes a KSAO (skill), not a task. Tasks describe observable work actions." },
    { text: "Multitask efficiently.", flaw: "Describes an ability, not a specific job task with action, object, and purpose." }
  ],
  "Software Engineer": [
    { text: "Code things.", flaw: "Too vague — no object, no tools/methods, no purpose." },
    { text: "Be good at problem solving.", flaw: "Describes an ability/trait, not a task. Tasks describe actions performed on the job." },
    { text: "Work with computers.", flaw: "Too vague — no specific action verb, no object, no purpose." },
    { text: "Think logically.", flaw: "Describes an ability, not a task. Task statements need observable actions." },
    { text: "Have programming knowledge.", flaw: "Describes knowledge (a KSAO), not a task. Tasks describe work activities." }
  ],
  "Trauma Surgeon": [
    { text: "Fix people.", flaw: "Too vague — no specific action verb, no tools/methods, no purpose." },
    { text: "Be calm under pressure.", flaw: "Describes a trait, not a task. Task statements require observable actions." },
    { text: "Do medical stuff.", flaw: "Too vague — no specific action verb, no object, no tools/methods, no purpose." },
    { text: "Have a steady hand.", flaw: "Describes an ability (a KSAO), not a task. Tasks describe work activities." },
    { text: "Know anatomy.", flaw: "Describes knowledge (a KSAO), not a task. Tasks describe actions performed on the job." }
  ]
};

const ROUND4 = {
  "Astronaut": [
    { type: "Skill", name: "Operation and Control" }, { type: "Knowledge", name: "Mechanical" },
    { type: "Skill", name: "Coordination" }, { type: "Ability", name: "Gross Body Coordination" }
  ],
  "Server": [
    { type: "Knowledge", name: "Customer and Personal Service" }, { type: "Ability", name: "Oral Comprehension" },
    { type: "Ability/Skill", name: "Oral Expression" }, { type: "Skill", name: "Active Listening" }
  ],
  "Software Engineer": [
    { type: "Knowledge", name: "Computers and Electronics" }, { type: "Skill", name: "Critical Thinking" },
    { type: "Ability", name: "Written Comprehension" }, { type: "Knowledge", name: "Engineering and Technology" }
  ],
  "Trauma Surgeon": [
    { type: "Knowledge", name: "Knoweldge of Medicine" }, { type: "Skill", name: "Complex Problem Solving" },
    { type: "Ability", name: "Social Perceptiveness" }, { type: "Ability", name: "Manual Dexterity" }
  ],
  _distractors: [
    { type: "Skill", name: "Monitoring" }, { type: "Ability", name: "Number Facility" }, { type: "Skill", name: "Negotiation" },
    { type: "Skill", name: "Time Management" }, { type: "Ability", name: "Stamina" }, { type: "Knowledge", name: "Administration and Management" },
    { type: "Skill", name: "Persuasion" }, { type: "Ability", name: "Mathematical Reasoning" }, { type: "Knowledge", name: "Law and Government" }
  ]
};

// ── ROUND 6 linkage answer key — full 10-task × 4-KSAO matrix from spreadsheet ──
const ROUND6 = {
  "Astronaut": {
    ksaos: ["Knowledge of Mechanical", "Coordination", "Operation and Control", "Gross Body Coordination"],
    // each row = [ksao0, ksao1, ksao2, ksao3] for that task
    answers: [
      [1,1,1,0], [1,0,1,0], [0,1,1,0], [0,0,0,1], [1,0,1,1],
      [1,1,1,1], [1,0,1,0], [0,1,1,0], [1,1,1,1], [1,1,1,1]
    ],
    totals: [7,6,9,5]
  },
  "Server": {
    ksaos: ["Knowledge of Customer and Personal Service", "Oral Comprehension", "Oral Expression", "Active Listening"],
    answers: [
      [1,1,1,1], [1,1,1,1], [1,1,1,0], [1,1,0,0], [0,1,1,1],
      [1,0,0,0], [1,1,1,1], [1,0,1,0], [1,0,1,0], [1,1,1,1]
    ],
    totals: [9,7,8,5]
  },
  "Software Engineer": {
    ksaos: ["Knowledge of Computers and Electronics", "Knowledge of Engineering and Technology", "Critical Thinking", "Written Comprehension"],
    answers: [
      [1,1,1,0], [1,1,1,1], [1,1,0,1], [1,0,0,1], [1,1,1,1],
      [1,1,1,1], [1,1,1,0], [1,1,0,0], [1,1,1,1], [1,1,1,0]
    ],
    totals: [10,9,7,6]
  },
  "Trauma Surgeon": {
    ksaos: ["Knowledge of Medicine", "Complex Problem Solving", "Social Perceptiveness", "Manual Dexterity"],
    answers: [
      [1,0,0,1], [1,0,1,1], [1,1,0,1], [1,1,0,0], [1,1,1,0],
      [1,1,0,1], [1,1,1,1], [1,1,1,0], [1,0,1,0], [1,1,1,0]
    ],
    totals: [10,7,6,5]
  }
};

// ──────────────────────────────────────────────────
// LEARNING CHALLENGE CARDS (wrong = lose points)
// ──────────────────────────────────────────────────
const LEARNING_CARDS = [
  {
    text: "Workplace Observation Challenge: Your manager asks you to observe a colleague's work process.",
    scenario: "You need to decide how to structure your observation.",
    question: "What's the BEST practice for workplace observation in job analysis?",
    options: ["Watch casually and take mental notes", "Use a structured form and time-sample behaviors", "Only observe when dramatic events happen", "Ask the person to perform unusual tasks"],
    correct: 1,
    explanation: "Structured observation with time-sampling provides systematic, reliable data.",
    rewards: [-5000, 20000, -10000, -5000]
  },
  {
    text: "Interview Skills Test: You're conducting a subject matter expert (SME) interview.",
    scenario: "The SME keeps giving vague answers.",
    question: "What's the BEST interviewing technique?",
    options: ["Accept vague answers to avoid conflict", "Use behavioral probing: 'Can you give me a specific example?'", "Move to a different topic quickly", "Tell them they're doing it wrong"],
    correct: 1,
    explanation: "Behavioral probing gets concrete, actionable data. Good interviewers probe respectfully for specifics.",
    rewards: [-5000, 20000, -5000, -15000]
  },
  {
    text: "Critical Incident Technique: A major project just failed at your company.",
    scenario: "This could be valuable for understanding job requirements.",
    question: "How should you use this critical incident in job analysis?",
    options: ["Ignore it - only look at successful performance", "Document what went wrong and what competencies could have prevented it", "Blame specific people publicly", "Use it to eliminate jobs"],
    correct: 1,
    explanation: "The Critical Incident Technique captures both successful and unsuccessful performance to identify essential competencies.",
    rewards: [-10000, 25000, -20000, -15000]
  },
  {
    text: "Task Statement Writing: You need to write task statements for the job analysis.",
    scenario: "Quality task statements are crucial for accurate job analysis.",
    question: "Which task statement is written BEST?",
    options: ["Does computer stuff daily", "Debugs software applications using systematic testing protocols to identify coding errors", "Works hard on code", "Helps the team"],
    correct: 1,
    explanation: "Good task statements include: an action verb, object, tools/methods, and purpose. Statement 2 does this perfectly.",
    rewards: [-5000, 20000, -8000, -5000]
  },
  {
    text: "KSAO Identification Challenge: HR wants to know if 'positive attitude' is a valid KSAO.",
    scenario: "You're reviewing competencies for a new role.",
    question: "Is 'positive attitude' a well-defined KSAO?",
    options: ["Yes - attitudes are important KSAOs", "No - it's too vague and hard to measure. Break it into observable behaviors", "Yes - everyone knows what positive means", "No - attitudes don't matter in jobs"],
    correct: 1,
    explanation: "'Positive attitude' is too vague. Better: 'Responds professionally to customer complaints' or 'Maintains composure during high-stress situations.'",
    rewards: [-5000, 20000, -5000, -10000]
  },
  {
    text: "Data Collection Planning: You have limited time and budget for your job analysis.",
    scenario: "You must choose the most efficient approach.",
    question: "What's the BEST strategy for efficient job analysis?",
    options: ["Only interview the highest performer", "Start with O*NET, then verify/customize with SME focus group", "Skip data collection and guess", "Survey everyone in the company"],
    correct: 1,
    explanation: "Starting with O*NET then customizing with SMEs is efficient and effective.",
    rewards: [-5000, 25000, -20000, -5000]
  },
  {
    text: "Job Analysis Update: The technology in your field just changed significantly.",
    scenario: "Your 5-year-old job analysis may be outdated.",
    question: "How often should job analyses typically be updated?",
    options: ["Never - they're permanent documents", "Every 3-5 years, or when significant changes occur", "Daily", "Only when legally required"],
    correct: 1,
    explanation: "Job analyses should be updated every 3-5 years or when major changes occur.",
    rewards: [-10000, 20000, -10000, -5000]
  },
  {
    text: "SME Selection: You need to choose subject matter experts for your job analysis.",
    scenario: "Who you choose dramatically affects data quality.",
    question: "What's the BEST approach for selecting SMEs?",
    options: ["Only select people management likes", "Choose diverse performers (new, experienced, different shifts) for comprehensive view", "Only select the newest employees", "Pick people randomly"],
    correct: 1,
    explanation: "Diverse SME selection provides a complete, unbiased picture of the job.",
    rewards: [-5000, 25000, -5000, -5000]
  }
];

// ──────────────────────────────────────────────────
// RANDOM ACTION CARDS (from spreadsheet) — Game of Life style
// ──────────────────────────────────────────────────
const ACTION_CARDS = [
  // ── ASTRONAUT ──
  { category:"Astronaut", text:"You\u2019re sending a rocket to space! Spin to see how high it goes. The higher the spin, the bigger the reward!", type:"spin_range", low_result:"Your rocket barely cleared the atmosphere.", high_result:"Your rocket reached orbit perfectly!", low_money:10000, high_money:20000 },
  { category:"Astronaut", text:"Your team encounters benevolent aliens who share the secrets of the universe.", type:"spin_range", low_result:"Your newfound knowledge brings prosperity to Earth!", high_result:"The new knowledge brings hostile aliens to Earth!", low_money:20000, high_money:-20000 },
  { category:"Astronaut", text:"You reach the international space station safely.", type:"spin_range", low_result:"You perform chores for all crew members as the rookie. For your troubles, you earn a small bonus.", high_result:"Your theories are supported in outer space!", low_money:5000, high_money:20000 },
  { category:"Astronaut", text:"You place a flag on the moon and you\u2019re over the moon!", type:"spin_range", low_result:"You\u2019re awarded a bonus on return.", high_result:"You win sponsorship deals!", low_money:50000, high_money:100000 },
  { category:"Astronaut", text:"You are the ambassador for educating the public about space exploration.", type:"spin_range", low_result:"Your talk was well received.", high_result:"Your talk went viral!", low_money:5000, high_money:10000 },
  { category:"Astronaut", text:"Your TikTok of outer space helped scientists discover a new pattern of planetary movement!", type:"spin_range", low_result:"The scientific community recognizes your contribution.", high_result:"You receive a major research grant!", low_money:15000, high_money:25000 },
  { category:"Astronaut", text:"You started a new business regarding space travel.", type:"spin_range", low_result:"Participants complained about their trip. It hit your business hard.", high_result:"You lead the first successful space tour!", low_money:-10000, high_money:25000 },
  { category:"Astronaut", text:"Your team discovered a new element on the Moon that could solve the energy storage problem.", type:"spin_range", low_result:"The element was merely a mirage.", high_result:"The potential has become a reality!", low_money:-10000, high_money:20000 },

  // ── SERVER ──
  { category:"Server", text:"Cook perfect pancakes! Shout out your favorite pancake topping!", type:"spin_range", low_result:"Your pancakes were a hit!", high_result:"Customers sent them back...", low_money:20000, high_money:-10000 },
  { category:"Server", text:"Compete for the best section in the restaurant. Spin the wheel!", type:"spin_range", low_result:"You got a decent section.", high_result:"You got the prime section!", low_money:5000, high_money:10000 },
  { category:"Server", text:"Your boss is impressed by your knowledge of beverages. You\u2019re promoted to bartender! Name your signature drink!", type:"spin_range", low_result:"Your drink is a flop!", high_result:"Your drink is a smash hit!", low_money:-10000, high_money:10000 },
  { category:"Server", text:"You successfully carry 5 trays of food from the kitchen to the table.", type:"spin_range", low_result:"Everyone applauds loudly!", high_result:"No one notices, but you still get paid.", low_money:10000, high_money:5000 },
  { category:"Server", text:"You met a generous tipper! Spin the wheel to see how much they tip you.", type:"multiplier", multiplier:1000, unit:"$1k per spin number" },
  { category:"Server", text:"You and your colleagues had a bet for your shifts. The loser covers the winner\u2019s shift for free.", type:"spin_range", low_result:"You won the bet!", high_result:"You lost the bet...", low_money:5000, high_money:-5000 },
  { category:"Server", text:"A fine-dining restaurant recently opened nearby and you\u2019d like to work there.", type:"spin_range", low_result:"You keep the same job. Nothing happens.", high_result:"They hire you and tips are great!", low_money:0, high_money:5000 },
  { category:"Server", text:"You accidentally ignited a liquor while flairing a cocktail!", type:"spin_range", low_result:"You put out the flame immediately. Close call! Small bonus for quick thinking.", high_result:"Customers call 911. You have to pay for damages.", low_money:2000, high_money:-5000 },
  { category:"Server", text:"Oh no, you spill coffee on your customers!", type:"spin_range", low_result:"Manager arrives before you can clean up.", high_result:"You cleaned up before the manager noticed!", low_money:-5000, high_money:0 },
  { category:"Server", text:"You\u2019re the head waiter for a very important event tomorrow.", type:"spin_range", low_result:"You arrive late due to traffic!", high_result:"You arrive on time!", low_money:-5000, high_money:0 },

  // ── SOFTWARE ENGINEER ──
  { category:"Software Engineer", text:"Invent a dancing robot! Spin to see how well it performs!", type:"spin_range", low_result:"The robot barely dances.", high_result:"The robot goes viral online!", low_money:5000, high_money:20000 },
  { category:"Software Engineer", text:"Oh no, you find a bug in your code!", type:"spin_range", low_result:"You can\u2019t fix the bug.", high_result:"You successfully fix the bug!", low_money:-5000, high_money:5000 },
  { category:"Software Engineer", text:"You\u2019re trying to sell your app to a large company. Shout out what the app does!", type:"spin_range", low_result:"Your pitch is successful!", high_result:"Your app was not a success.", low_money:20000, high_money:-20000 },
  { category:"Software Engineer", text:"You got your Scrum certification! Time to ask for a promotion!", type:"spin_range", low_result:"You get the promotion AND a bonus!", high_result:"You get the promotion but no bonus.", low_money:10000, high_money:0 },
  { category:"Software Engineer", text:"Oh no! Coffee spilled all over your computer and it\u2019s completely broken.", type:"spin_range", low_result:"Replacement costs you a bit.", high_result:"Replacement costs you a lot.", low_money:-5000, high_money:-10000 },
  { category:"Software Engineer", text:"You help a coworker debug their code before the deadline. They\u2019re so grateful!", type:"spin_range", low_result:"They give you a small portion of their bonus.", high_result:"They give you a generous portion of their bonus!", low_money:5000, high_money:10000 },
  { category:"Software Engineer", text:"You accidentally weakened the security system for private customer databases at the bank.", type:"spin_range", low_result:"You recover the security system in time!", high_result:"Data was compromised. You face a lawsuit.", low_money:10000, high_money:-30000 },

  // ── TRAUMA SURGEON ──
  { category:"Trauma Surgeon", text:"Cha-Ching!! The trauma patient you saved is a rich person who rewards you handsomely!", type:"multiplier", multiplier:5000, unit:"$5k per spin number" },
  { category:"Trauma Surgeon", text:"You perform a successful heart transplant operation.", type:"spin_range", low_result:"The hospital recognizes your achievement.", high_result:"The hospital AND the media celebrate your success!", low_money:10000, high_money:20000 },
  { category:"Trauma Surgeon", text:"During surgery, you experience an unforeseen accident resulting in the loss of a patient.", type:"spin_range", low_result:"The family accepts it was unavoidable.", high_result:"The family pursues legal action.", low_money:-10000, high_money:-20000 },
  { category:"Trauma Surgeon", text:"You\u2019ve developed a new surgical technique! You win the Nobel Prize!", type:"spin_range", low_result:"The Nobel committee awards you a standard prize.", high_result:"The Nobel committee awards you an exceptional prize!", low_money:20000, high_money:50000 },
  { category:"Trauma Surgeon", text:"You\u2019re assigned to carry out a craniectomy (removing part of the skull to relieve brain pressure).", type:"spin_range", low_result:"The patient fully recovers!", high_result:"The surgery has complications. The family sues.", low_money:10000, high_money:-10000 },
  { category:"Trauma Surgeon", text:"You successfully separate conjoined twins!", type:"spin_range", low_result:"The twins\u2019 family donates to your team in gratitude.", high_result:"The twins\u2019 family makes a generous donation!", low_money:10000, high_money:20000 },
  { category:"Trauma Surgeon", text:"The power goes out in your hospital and the generator breaks. Your quick thinking with medivac saves everyone!", type:"spin_range", low_result:"The hospital gives you a large bonus.", high_result:"The hospital gives you a small bonus.", low_money:10000, high_money:5000 },
  { category:"Trauma Surgeon", text:"Your impeccable record puts you in the running for a promotion.", type:"spin_range", low_result:"A competing surgeon gets the media spotlight. No promotion.", high_result:"The hospital recognizes your performance. Promotion!", low_money:0, high_money:20000 },

  // ── GENERAL ──
  { category:"General", text:"Congratulations! You received a promotion!", type:"spin_range", low_result:"You receive a standard bonus.", high_result:"You receive a big bonus!", low_money:10000, high_money:20000 },
  { category:"General", text:"Hooray, you passed a job certification exam!", type:"spin_range", low_result:"You passed with a good score.", high_result:"You passed with flying colors!", low_money:10000, high_money:20000 },
  { category:"General", text:"You started a conversation with a keynote speaker at a conference. They want to donate to your study!", type:"spin_range", low_result:"They donate a modest amount.", high_result:"They donate generously!", low_money:5000, high_money:10000 },
  { category:"General", text:"Happy Monday!! It\u2019s just a normal day at work.", type:"flat", money:2000 },
  { category:"General", text:"Whoopsie Daisy! You accidentally damage company property.", type:"spin_range", low_result:"Minor damage, small deduction.", high_result:"Major damage, bigger deduction.", low_money:-5000, high_money:-10000 },
  { category:"General", text:"A company wants to hire you for independent consulting work!", type:"spin_range", low_result:"They offer you a decent contract.", high_result:"They offer you a premium contract!", low_money:10000, high_money:15000 },

  // ── JOB ANALYSIS ──
  { category:"Job Analysis", text:"While conducting the job analysis, you noticed the job site conditions were hazardous. You reported them!", type:"spin_range", low_result:"You receive a small bonus for thoroughness.", high_result:"You receive a large bonus for thoroughness!", low_money:5000, high_money:10000 },
  { category:"Job Analysis", text:"Your job analysis requires developing a new job-specific questionnaire. This is expensive!", type:"spin_range", low_result:"Development costs are manageable.", high_result:"Development costs are high.", low_money:-5000, high_money:-10000 },
  { category:"Job Analysis", text:"The SME you were interviewing decided to quit mid-analysis. This delays everything.", type:"spin_range", low_result:"Minor delays, minor cost.", high_result:"Major delays, major cost.", low_money:-5000, high_money:-10000 },
  { category:"Job Analysis", text:"You interview a rockstar SME who helps you write fantastic task statements!", type:"spin_range", low_result:"Great task statements earn you a nice reward.", high_result:"Solid task statements earn you a bonus.", low_money:10000, high_money:5000 },
  { category:"Job Analysis", text:"You got distracted by the office dog during your job analysis site visit and played with it for 2 hours!", type:"spin_range", low_result:"The company fines you for significant lost time.", high_result:"The company fines you for some lost time.", low_money:-10000, high_money:-5000 },
  { category:"Job Analysis", text:"While interviewing employees, you discover they invented their own communication style! This helps you write great skill statements.", type:"spin_range", low_result:"Your skill statements earn you a bonus.", high_result:"Your exceptional skill statements earn you a bigger bonus!", low_money:5000, high_money:10000 },
  { category:"Job Analysis", text:"The fire alarm went off during your focus group and everyone had to evacuate!", type:"spin_range", low_result:"Minor disruption, minor cost.", high_result:"Major disruption, major cost.", low_money:-5000, high_money:-10000 },
  { category:"Job Analysis", text:"While conducting the job analysis, you discovered an embezzlement scheme!", type:"spin_range", low_result:"The organization gives you a small reward.", high_result:"The organization gives you a large reward!", low_money:5000, high_money:10000 },
  { category:"Job Analysis", text:"You get 100% response rate on your task and KSAO survey! The organization is thrilled.", type:"spin_range", low_result:"You are rewarded handsomely!", high_result:"You are rewarded very generously!", low_money:20000, high_money:25000 },

  // ── JOB CHANGE CARDS ──
  { category:"General", text:"Oh no! Your organization is downsizing. You\u2019ve been let go. Spin the wheel for a new occupation!", type:"job_change" },
  { category:"Job Analysis", text:"Uh oh! The work tasks are completely different from the job description. Spin for a new occupation!", type:"job_change" }
];

function jobFromSpin(n) {
  if (n === 1 || n === 5) return "Astronaut";
  if (n === 2 || n === 6) return "Server";
  if (n === 3 || n === 7) return "Software Engineer";
  if (n === 4 || n === 8) return "Trauma Surgeon";
  return JOBS[Math.floor(Math.random() * JOBS.length)];
}

// ------------------------------
// STATE
// ------------------------------
const state = {
  team: "Team Alpha",
  bank: 0,
  tile: 0,
  boardSize: 40,
  currentRoundIndex: 0,
  currentJob: null,
  flashHint: null,
  roundsCompleted: [],
  roundAnswers: {},
  moveLocked: false,
  usedLearningCards: []   // track used learning card indices so no repeats
};

const ROUNDS = [
  { key: "R1", name: "Round 1 — College vs. Career",              tile: 3  },
  { key: "R2", name: "Round 2 — Finding a Partner",               tile: 10 },
  { key: "R3", name: "Round 3 — Task Statement Identification",   tile: 17 },
  { key: "R4", name: "Round 4 — Buying a House (KSAOs)",          tile: 24 },
  { key: "R5", name: "Round 5 — Family vs. No Family (Scales)",   tile: 31 },
  { key: "R6", name: "Round 6 — Route to Retirement",             tile: 38 }
];

// ------------------------------
// UTIL
// ------------------------------
const $ = sel => document.querySelector(sel);
function fmt(n) { return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }
function roll(d = 6) { return Math.floor(Math.random() * d) + 1; }
function spin10() { return Math.floor(Math.random() * 10) + 1; }

function openModal(title, bodyEl) {
  const dlg = $("#modal");
  $("#modalTitle").textContent = title;
  const body = $("#modalBody");
  body.innerHTML = "";
  body.appendChild(bodyEl);
  dlg.showModal();
}
$("#modalClose").addEventListener('click', () => {
  // block closing if there's an unanswered learning challenge
  const modal = $("#modal");
  if (modal.dataset.requireAnswer === 'true') {
    const btn = $("#modalClose");
    btn.textContent = '⚠️ Answer first!';
    btn.style.background = 'var(--error)'; btn.style.color = '#fff';
    setTimeout(() => { btn.textContent = 'Close'; btn.style.background = ''; btn.style.color = ''; }, 1500);
    return;
  }
  modal.close();
});

function openRoundStopModal(roundObj, contentEl) {
  const dlg = $("#roundStopModal");
  $("#roundStopTitle").textContent = roundObj.name;
  $("#roundStopBanner").innerHTML = `🛑 New Round!<span class="round-number">${roundObj.name}</span>`;
  const body = $("#roundStopBody");
  body.innerHTML = "";
  body.appendChild(contentEl);
  dlg.showModal();
}

// prevent escape key from closing dialogs when answer is required
$("#roundStopModal").addEventListener('cancel', (e) => {
  const currentRound = ROUNDS[state.currentRoundIndex];
  if (currentRound && !isRoundAnswered(currentRound.key)) e.preventDefault();
});
$("#modal").addEventListener('cancel', (e) => {
  if ($("#modal").dataset.requireAnswer === 'true') e.preventDefault();
});
$("#roundStopClose").addEventListener('click', () => {
  // only allow closing if the round has been answered
  const currentRound = ROUNDS[state.currentRoundIndex];
  if (currentRound && !isRoundAnswered(currentRound.key)) {
    // flash the button to indicate they must answer first
    const btn = $("#roundStopClose");
    btn.textContent = '⚠️ Answer the question first!';
    btn.style.background = 'var(--error)';
    setTimeout(() => { btn.textContent = '✅ Continue Playing'; btn.style.background = ''; }, 1500);
    return;
  }
  $("#roundStopModal").close();
  state.moveLocked = false;
});

// ──────────────────────────────────────────────────
// NUMBERED WHEEL (SVG-based, 1–10) — blue/green palette
// ──────────────────────────────────────────────────
const WHEEL_COLORS = ['#0d9488','#2563eb','#059669','#3b82f6','#0f766e','#60a5fa','#10b981','#1d4ed8','#6ee7b7','#1e40af'];

function createWheelHTML() {
  const sliceAngle = 36;
  let paths = '';
  for (let i = 0; i < 10; i++) {
    const startAngle = i * sliceAngle - 90;
    const endAngle = startAngle + sliceAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const r = 120;
    const cx = 130, cy = 130;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    paths += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z" fill="${WHEEL_COLORS[i]}" stroke="#fff" stroke-width="2"/>`;
    const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
    const labelR = 85;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    paths += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="800" font-size="16" style="text-shadow:0 1px 3px #0006">${i + 1}</text>`;
  }
  return `<div class="wheel-container">
    <div class="wheel-pointer"></div>
    <svg class="wheel-svg" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">${paths}</svg>
    <div class="wheel-center"></div>
  </div>`;
}

function spinWheelAnimation(container, callback) {
  const svg = container.querySelector('.wheel-svg');
  const result = spin10();
  const targetAngle = (result - 1) * 36 + 18;
  const totalRotation = 360 * 5 + (360 - targetAngle);
  svg.style.transition = 'none';
  svg.style.transform = 'rotate(0deg)';
  svg.offsetHeight;
  svg.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  svg.style.transform = `rotate(${totalRotation}deg)`;
  setTimeout(() => callback(result), 3200);
}

// ──────────────────────────────────────────────────
// INIT UI
// ──────────────────────────────────────────────────
const leaderTbody = $("#leaderTable tbody");
function renderLeaders() {
  leaderTbody.innerHTML = `<tr><td>${state.team}</td><td class="money">${fmt(state.bank)}</td></tr>`;
}
renderLeaders();

function updateProgressIndicator() {
  const dots = document.querySelectorAll('.progress-indicator .progress-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('complete', 'current');
    if (i < state.currentRoundIndex) dot.classList.add('complete');
    else if (i === state.currentRoundIndex) dot.classList.add('current');
  });
}

$("#startBtn").addEventListener('click', () => {
  state.team = $("#teamName").value.trim() || "Team";
  $("#setupCard").style.display = 'none';
  $("#boardCard").style.display = '';
  $("#roundCard").style.display = '';
  buildBoard();
  updateHUD();
  updateProgressIndicator();
  introJobSpin();
});

function buildBoard() {
  const board = $("#board");
  board.innerHTML = '';
  for (let i = 0; i < state.boardSize; i++) {
    const t = document.createElement('div');
    t.className = 'tile';
    t.textContent = i + 1;
    const roundAt = ROUNDS.find(r => r.tile === i);
    if (roundAt) { t.dataset.round = roundAt.key; t.title = roundAt.name; }
    board.appendChild(t);
  }
  const p = document.createElement('div');
  p.className = 'player';
  board.firstElementChild.appendChild(p);
}

function updateHUD() {
  $("#bank").textContent = fmt(state.bank);
  const cr = ROUNDS[state.currentRoundIndex];
  $("#roundName").textContent = cr ? cr.name : "Setup";
  renderLeaders();
  updateProgressIndicator();
}

// ── flash the last roll number ──
function showLastRoll(n) {
  const el = $("#lastRoll");
  el.textContent = n;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 600);
}

// ------------------------------
// MOVEMENT
// ------------------------------
function move(steps) {
  if (state.moveLocked) return;
  showLastRoll(steps);
  const board = $("#board");
  const tiles = [...board.children];
  let currentPos = state.tile;
  const targetPos = Math.min(state.tile + steps, state.boardSize - 1);

  const animateStep = () => {
    if (currentPos < targetPos) {
      tiles[currentPos].classList.remove('active');
      currentPos++;
      tiles[currentPos].classList.add('active');

      const passingRound = ROUNDS.find(r => r.tile === currentPos);
      if (passingRound) {
        state.tile = currentPos;
        tiles.forEach(t => { const p = t.querySelector('.player'); if (p) p.remove(); t.classList.remove('active'); });
        tiles[state.tile].appendChild(Object.assign(document.createElement('div'), { className: 'player' }));
        $("#status").textContent = `Stopped at tile ${state.tile + 1} — New Round!`;
        triggerRoundStop(passingRound);
        return;
      }
      setTimeout(animateStep, 200);
    } else {
      state.tile = targetPos;
      tiles.forEach(t => { const p = t.querySelector('.player'); if (p) p.remove(); t.classList.remove('active'); });
      tiles[state.tile].appendChild(Object.assign(document.createElement('div'), { className: 'player' }));
      $("#status").textContent = `Moved to tile ${state.tile + 1}`;

      if (state.tile === state.boardSize - 1) { endGame(); return; }

      setTimeout(() => triggerRandomEvent(), 500);
    }
  };

  tiles[currentPos].classList.add('active');
  setTimeout(animateStep, 200);
}

function endGame() {
  $("#rollBtn").disabled = true;
  $("#spinCardBtn").disabled = true;
  setTimeout(() => {
    const end = document.createElement('div');
    end.innerHTML = `<h3>🏁 Congratulations! You've reached retirement!</h3>
      <p>Your final bank: <b>${fmt(state.bank)}</b></p>
      <p class='mt8'>You've completed your Career Quest and learned about:</p>
      <ul><li>Data collection methods for job analysis</li><li>Task statement identification</li><li>Rating scale selection</li><li>KSAO identification</li><li>Linkage analysis for competencies</li></ul>
      <p class='mt8 muted'>Great job applying these I/O Psychology concepts!</p>`;
    openModal('🎉 Game Complete!', end);
  }, 400);
}

// ★ Random event after every non-round roll
function triggerRandomEvent() {
  if (Math.random() < 0.5) {
    drawLearningChallenge();
  } else {
    drawRandomActionCard();
  }
}

// ──────────────────────────────────────────────────
// ROUND HARD-STOP
// ──────────────────────────────────────────────────
function triggerRoundStop(roundObj) {
  state.moveLocked = true;
  state.currentRoundIndex = ROUNDS.indexOf(roundObj);
  updateHUD();
  const content = document.createElement('div');
  if (isRoundAnswered(roundObj.key)) {
    content.appendChild(buildAlreadyAnsweredBlock(roundObj.key));
  } else {
    buildRoundChallenge(roundObj, content, true);
  }
  openRoundStopModal(roundObj, content);
  openRoundSidebar(roundObj);
}

function isRoundAnswered(key) { return state.roundsCompleted.includes(key); }

function buildAlreadyAnsweredBlock(key) {
  const data = state.roundAnswers[key];
  const div = document.createElement('div');
  div.className = 'answered-lock';
  if (!data) {
    div.innerHTML = `<h4><span class="lock-icon">🔒</span> Already Completed</h4><p>You have already completed this round.</p>`;
    return div;
  }
  const statusIcon = data.status === 'correct' ? '✅' : data.status === 'partial' ? '⚠️' : '❌';
  const statusLabel = data.status === 'correct' ? 'Correct' : data.status === 'partial' ? 'Partial Credit' : 'Incorrect';
  div.innerHTML = `<h4><span class="lock-icon">🔒</span> Round Already Completed — ${statusIcon} ${statusLabel}</h4>
    <p><b>Your answer:</b> ${data.answer}</p>
    <p><b>Money earned:</b> ${fmt(data.money)}</p>
    <hr style="border:none;border-top:1px solid #d1d5db;margin:10px 0"/>
    <p><b>📖 Explanation:</b></p><p>${data.explanation}</p>`;
  return div;
}

$("#rollBtn").addEventListener('click', () => { if (!state.moveLocked) move(roll()); });
$("#spinCardBtn").addEventListener('click', drawLearningChallenge);

// ──────────────────────────────────────────────────
// JOB SELECTION — NUMBERED WHEEL
// ──────────────────────────────────────────────────
function introJobSpin() {
  const box = document.createElement('div');
  box.innerHTML = `<p>Spin the numbered wheel to determine your career path!</p>
    <p class='muted mt8'>🎯 1,5: Astronaut · 2,6: Server · 3,7: Software Engineer · 4,8: Trauma Surgeon · 9-10: Random</p>
    ${createWheelHTML()}`;

  const btn = Object.assign(document.createElement('button'), { textContent: '🎯 Spin the Wheel!', className: 'mt12' });
  const out = Object.assign(document.createElement('div'), { className: 'wheel-result' });

  btn.addEventListener('click', () => {
    btn.disabled = true;
    const wheelContainer = box.querySelector('.wheel-container');
    spinWheelAnimation(wheelContainer, (n) => {
      const job = jobFromSpin(n);
      state.currentJob = job;
      state.flashHint = `Starting job: ${job}`;
      out.innerHTML = `<b>You spun ${n}!</b> → <b>${job}</b>`;
      $("#roundTitle").textContent = 'Current Job';
      $("#roundBody").innerHTML = `<div class="hint">${state.flashHint}</div>
        <p class='mt8'>As a <b>${job}</b>, you'll navigate through job analysis challenges specific to this occupation.</p>
        <p class='mt8 muted'>Roll the dice to move forward and complete each round.</p>`;
      setTimeout(() => $("#modal").close(), 2500);
    });
  });

  box.append(btn, out);
  openModal('🎯 Choose Your Career Path', box);
}

// ──────────────────────────────────────────────────
// SIDEBAR round info
// ──────────────────────────────────────────────────
function openRoundSidebar(r) {
  state.currentRoundIndex = ROUNDS.indexOf(r);
  $("#roundTitle").textContent = r.name;
  const mount = $("#roundBody");
  mount.innerHTML = '';
  if (!state.currentJob) { introJobSpin(); return; }
  if (isRoundAnswered(r.key)) { mount.appendChild(buildAlreadyAnsweredBlock(r.key)); return; }
  const hint = state.flashHint ? `<div class='hint mt8'>💡 ${state.flashHint}</div>` : '';
  buildRoundChallenge(r, mount, false, hint);
}

// ──────────────────────────────────────────────────
// ROUND CHALLENGE BUILDER
// ──────────────────────────────────────────────────
function buildRoundChallenge(r, mount, insideStopModal, hint = '') {
  function lockRound(key, status, answer, money, explanation) {
    state.roundAnswers[key] = { status, answer, money, explanation };
    if (!state.roundsCompleted.includes(key)) state.roundsCompleted.push(key);
    updateProgressIndicator();
  }

  // ── ROUND 1 ──
  if (r.key === 'R1') {
    mount.innerHTML += `<p>Before conducting a full job analysis for <b>${state.currentJob}</b>, consult existing info sources.</p>
      <p class='muted mt8'>Select sources (1-3 recommended):</p>
      <div class='mt8 options'>${['Job Description','Prior JA','O*NET'].map(s=>`<label><input type='checkbox' value='${s}' class='r1opt'/> ${s}</label>`).join('')}</div>
      <div class='row mt12'><button class='r1Submit'>📊 Submit Analysis</button></div>${hint}`;
    mount.querySelector('.r1Submit').onclick = function() {
      const selected = [...mount.querySelectorAll('.r1opt:checked')];
      const count = selected.length; const money = ROUND1_SCORING[Math.min(count,3)]||0;
      addMoney(money);
      const answerText = selected.map(s=>s.value).join(', ')||'none';
      let status, exp;
      if(count===3){ status='correct'; exp=`Using all three sources provides comprehensive baseline data. ${Object.entries(ROUND1_EXPLANATIONS).map(([k,v])=>k+' — '+v).join('; ')}`; }
      else if(count===2){ status='partial'; exp=`You selected ${answerText}. Using all three sources provides the most comprehensive starting point.`; }
      else{ status='incorrect'; exp=`Relying on just one source risks missing important information. Best practice is to consult all three before primary data collection.`; }
      const fb = document.createElement('div'); fb.className = `feedback ${status==='correct'?'correct':status==='partial'?'partial':'incorrect'}`;
      const icon = status==='correct'?'✅':status==='partial'?'⚠️':'❌';
      fb.innerHTML = `<h4>${icon} ${status==='correct'?'Excellent!':status==='partial'?'Good, But Could Be Better':'Incomplete'}</h4><p><b>${fmt(money)}</b></p><p class='mt8'>${exp}</p>`;
      mount.querySelectorAll('.r1opt').forEach(cb=>cb.disabled=true); this.disabled=true;
      mount.appendChild(fb); lockRound('R1',status,answerText,money,exp);
    };
  }

  // ── ROUND 2 ──
  if (r.key === 'R2') {
    const methods=[{k:'O',label:'Observation'},{k:'I',label:'Interview'},{k:'F',label:'Focus Group'}];
    mount.innerHTML += `<p>Select data collection method(s) for <b>${state.currentJob}</b>.</p>
      <div class='mt8 options'>${methods.map(m=>`<label><input type='checkbox' value='${m.k}' class='r2opt'/> ${m.label}</label>`).join('')}</div>
      <div class='row mt12'><button class='r2Submit'>📋 Submit Methods</button></div>${hint}`;
    mount.querySelector('.r2Submit').onclick = function() {
      const keys=[...mount.querySelectorAll('.r2opt:checked')].map(x=>x.value).sort().join('');
      const map={'F':'F','I':'I','O':'O','FI':'IF','FO':'OF','IO':'OI','FIO':'OIF','IFO':'OIF','OFI':'OIF','OIF':'OIF','FOI':'OIF'};
      const combo=map[keys]||keys; const pts=ROUND2[state.currentJob]?.[combo]||0; const money=pts*1000;
      addMoney(money);
      const je=ROUND2_EXPLANATIONS[state.currentJob]; let status,exp;
      if(pts>=20){status='correct';exp=`${combo} works for ${state.currentJob}: ${je.explanation}`;}
      else if(pts>=10){status='partial';exp=`Your selection (${combo}) was decent. Better: ${je.best}. ${je.explanation}`;}
      else{status='incorrect';exp=`Recommended: ${je.best}. ${je.explanation}`;}
      const fb=document.createElement('div');fb.className=`feedback ${status==='correct'?'correct':status==='partial'?'partial':'incorrect'}`;
      const icon=status==='correct'?'✅':status==='partial'?'⚠️':'❌';
      fb.innerHTML=`<h4>${icon}</h4><p><b>${fmt(money)} (${pts}pts)</b></p><p class='mt8'>${exp}</p>`;
      mount.querySelectorAll('.r2opt').forEach(cb=>cb.disabled=true);this.disabled=true;
      mount.appendChild(fb);lockRound('R2',status,combo||'none',money,exp);
    };
  }

  // ── ROUND 3 — TASK STATEMENT IDENTIFICATION (NEW!) ──
  if (r.key === 'R3') {
    const goodTasks = TASK_STATEMENTS[state.currentJob];
    const badTasks = BAD_TASK_STATEMENTS[state.currentJob];

    // pick 3 random good task statements
    const shuffledGood = [...goodTasks].sort(() => Math.random() - 0.5);
    const correctStatements = shuffledGood.slice(0, 3);

    // pick 3 random bad task statements
    const shuffledBad = [...badTasks].sort(() => Math.random() - 0.5);
    const wrongStatements = shuffledBad.slice(0, 3);

    // combine and shuffle
    const allOptions = [
      ...correctStatements.map(t => ({ text: t, isGood: true })),
      ...wrongStatements.map(t => ({ text: t.text, isGood: false, flaw: t.flaw }))
    ].sort(() => Math.random() - 0.5);

    mount.innerHTML += `<p>As a <b>${state.currentJob}</b>, you need to identify which task statements are <b>properly written</b>.</p>
      <div class="task-requirements">
        <h4>📋 A well-written task statement must have:</h4>
        <ul>
          <li><b>Action verb</b> — what is done (e.g., "Operate," "Analyze," "Prepare")</li>
          <li><b>Object</b> — what the action is performed on (e.g., "spacecraft," "patients")</li>
          <li><b>Tools/methods</b> — how it's done (e.g., "using radio equipment")</li>
          <li><b>Purpose/context</b> — why (e.g., "to identify coding errors")</li>
        </ul>
      </div>
      <p class='muted mt8'>Select all <b>properly written</b> task statements (there are exactly 3):</p>
      <div class='mt8 r3-options'></div>
      <div class='row mt12'><button class='r3Submit'>📝 Submit Task Statements</button></div>${hint}`;

    const optionsContainer = mount.querySelector('.r3-options');
    allOptions.forEach((opt, i) => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.dataset.idx = i;
      card.dataset.good = opt.isGood;
      if (!opt.isGood) card.dataset.flaw = opt.flaw;
      card.innerHTML = `<input type="checkbox" class="task-radio r3check" data-idx="${i}" />
        <span class="task-label">${opt.text}</span>`;
      card.addEventListener('click', (e) => {
        if (card.classList.contains('locked')) return;
        if (e.target.tagName !== 'INPUT') {
          const cb = card.querySelector('input');
          cb.checked = !cb.checked;
        }
        card.classList.toggle('selected', card.querySelector('input').checked);
      });
      optionsContainer.appendChild(card);
    });

    mount.querySelector('.r3Submit').onclick = function() {
      const cards = [...mount.querySelectorAll('.task-card')];
      const checks = [...mount.querySelectorAll('.r3check')];
      let correctPicks = 0;
      let wrongPicks = 0;

      cards.forEach((card, i) => {
        const checked = checks[i].checked;
        const isGood = card.dataset.good === 'true';
        card.classList.add('locked');
        checks[i].disabled = true;

        if (checked && isGood) {
          correctPicks++;
          card.classList.add('correct-answer');
        } else if (checked && !isGood) {
          wrongPicks++;
          card.classList.add('wrong-answer');
        } else if (!checked && isGood) {
          // missed a good one — mark it green so they can see
          card.classList.add('correct-answer');
          card.style.opacity = '0.6';
        }
      });

      const money = (correctPicks * 5000) - (wrongPicks * 5000);
      addMoney(money);

      let status, exp;
      if (correctPicks === 3 && wrongPicks === 0) {
        status = 'correct';
        exp = `Perfect! You correctly identified all 3 well-written task statements. Each has a clear action verb, object, tools/methods, and purpose — the hallmarks of a strong task statement.`;
      } else if (correctPicks >= 2 && wrongPicks <= 1) {
        status = 'partial';
        let wrongInfo = '';
        cards.forEach((card, i) => {
          if (checks[i].checked && card.dataset.good === 'false') {
            wrongInfo += ` "${allOptions[i].text}" — ${card.dataset.flaw}`;
          }
        });
        exp = `You got ${correctPicks}/3 correct with ${wrongPicks} wrong pick(s). Remember: good task statements need an action verb + object + tools/methods + purpose.${wrongInfo ? ' Flaws in your wrong picks:' + wrongInfo : ''}`;
      } else {
        status = 'incorrect';
        let wrongInfo = '';
        cards.forEach((card, i) => {
          if (checks[i].checked && card.dataset.good === 'false') {
            wrongInfo += `<br>• "${allOptions[i].text}" — ${card.dataset.flaw}`;
          }
        });
        exp = `You got ${correctPicks}/3 correct with ${wrongPicks} wrong pick(s). A well-written task statement must include: (1) action verb, (2) object, (3) tools/methods, and (4) purpose. Vague statements or trait/KSAO descriptions are NOT tasks.${wrongInfo ? '<br><b>Flaws:</b>' + wrongInfo : ''}`;
      }

      const fb = document.createElement('div');
      fb.className = `feedback ${status === 'correct' ? 'correct' : status === 'partial' ? 'partial' : 'incorrect'}`;
      const icon = status === 'correct' ? '✅' : status === 'partial' ? '⚠️' : '❌';
      fb.innerHTML = `<h4>${icon} ${status === 'correct' ? 'Excellent!' : status === 'partial' ? 'Good Effort' : 'Needs Work'}</h4>
        <p><b>${fmt(money)} (${correctPicks} correct, ${wrongPicks} wrong)</b></p><p class='mt8'>${exp}</p>`;
      this.disabled = true;
      mount.appendChild(fb);
      lockRound('R3', status, `${correctPicks}/3 correct, ${wrongPicks} wrong`, money, exp);
    };
  }

  // ── ROUND 4 ──
  if (r.key==='R4') {
    // pick 6 random distractors to mix with the 4 correct ones
    const shuffledDistractors = [...ROUND4._distractors].sort(() => Math.random() - 0.5).slice(0, 6);
    const pool=[...ROUND4[state.currentJob],...shuffledDistractors].sort(()=>Math.random()-0.5);
    mount.innerHTML+=`<p>Select the <b>four KSAOs</b> most essential for <b>${state.currentJob}</b>.</p>
      <div class='mt8 options'>${pool.map(x=>`<label><input type='checkbox' class='r4opt' data-name='${x.name}'/> ${x.name}</label>`).join('')}</div>
      <div class='row mt12'><button class='r4Submit'>🎯 Submit KSAOs</button></div>${hint}`;
    mount.querySelector('.r4Submit').onclick=function(){
      const selected=[...mount.querySelectorAll('.r4opt:checked')].map(x=>x.dataset.name);
      const correctSet=new Set(ROUND4[state.currentJob].map(x=>x.name));
      const correct=selected.filter(n=>correctSet.has(n)); const incorrect=selected.filter(n=>!correctSet.has(n));
      const count=correct.length; const money=count*5000; addMoney(money);
      let status,exp; const answerText=selected.join(', ')||'none';
      if(count===4&&incorrect.length===0){status='correct';exp=`Perfect! ${correct.join(', ')} are the core competencies for ${state.currentJob}.`;}
      else if(count>=2){status='partial';const missed=[...correctSet].filter(x=>!selected.includes(x)).join(', ');exp=`${count}/4 correct. Missed: ${missed}. Focus on KSAOs essential AND differentiating for this specific job.`;}
      else{status='incorrect';exp=`The correct KSAOs were: ${[...correctSet].join(', ')}. Ask: "Could someone succeed WITHOUT this competency?"`;}
      const fb=document.createElement('div');fb.className=`feedback ${status==='correct'?'correct':status==='partial'?'partial':'incorrect'}`;
      const icon=status==='correct'?'✅':status==='partial'?'⚠️':'❌';
      fb.innerHTML=`<h4>${icon}</h4><p><b>${fmt(money)} (${count}/4)</b></p><p class='mt8'>${exp}</p>`;
      mount.querySelectorAll('.r4opt').forEach(cb=>cb.disabled=true);this.disabled=true;
      mount.appendChild(fb);lockRound('R4',status,answerText,money,exp);
    };
  }

  // ── ROUND 5 (rating scales — now references task statements & KSAOs) ──
  if (r.key==='R5') {
    const choices=['F','I','NE','ENJ'];
    // pull sample task statement and KSAOs for context
    const sampleTasks = TASK_STATEMENTS[state.currentJob] || [];
    const sampleTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)] || 'Perform job duties.';
    const jobKsaos = ROUND4[state.currentJob] || [];
    const ksaoNames = jobKsaos.map(k => k.name).join(', ');

    mount.innerHTML+=`<p>Now that you've identified task statements and KSAOs for <b>${state.currentJob}</b>, you need to choose the best <b>rating scales</b> to evaluate how important each task and KSAO is to the job.</p>
      <div class="task-requirements mt8">
        <h4>📋 Context from your job analysis so far:</h4>
        <p style="margin:4px 0"><b>Sample task:</b> <em>"${sampleTask}"</em></p>
        <p style="margin:4px 0"><b>KSAOs identified:</b> ${ksaoNames}</p>
      </div>
      <p class='mt12'>Which rating scales should SMEs use to evaluate the tasks and KSAOs above?</p>
      <p class='muted mt8'>F=Frequency, I=Importance, NE=Needed at Entry, ENJ=Enjoyment</p>
      <div class='mt8 options'>${choices.map(c=>`<label><input type='checkbox' class='r5opt' value='${c}'/> ${SCALE_EXPLANATIONS[c]}</label>`).join('')}</div>
      <div class='row mt12'><button class='r5Submit'>📐 Submit Scales</button></div>${hint}`;
    mount.querySelector('.r5Submit').onclick=function(){
      const pick=[...mount.querySelectorAll('.r5opt:checked')].map(x=>x.value).sort().join('+');
      const money=ROUND35[pick]??0; addMoney(money);
      let status,exp;
      if(money>=20000){status='correct';exp=`${ROUND35_EXPLANATION} Your combination (${pick}) is excellent!`;}
      else if(money>=10000){status='partial';exp=`Your selection (${pick}) was decent. ${ROUND35_EXPLANATION}`;}
      else{status='incorrect';exp=`${ROUND35_EXPLANATION} ENJ doesn't define the job itself.`;}
      const fb=document.createElement('div');fb.className=`feedback ${status==='correct'?'correct':status==='partial'?'partial':'incorrect'}`;
      const icon=status==='correct'?'✅':status==='partial'?'⚠️':'❌';
      fb.innerHTML=`<h4>${icon}</h4><p><b>${fmt(money)}</b></p><p class='mt8'>${exp}</p>`;
      mount.querySelectorAll('.r5opt').forEach(cb=>cb.disabled=true);this.disabled=true;
      mount.appendChild(fb);lockRound('R5',status,pick||'none',money,exp);
    };
  }

  // ── ROUND 6 — LINKAGE TABLE (checkbox matching, 10 tasks × 4 KSAOs) ──
  if (r.key==='R6') {
    const cfg = ROUND6[state.currentJob];
    const tasks = TASK_STATEMENTS[state.currentJob];
    const ksaos = cfg.ksaos;

    mount.innerHTML += `<p><b>Final Challenge:</b> Build a KSAO–Task linkage table for <b>${state.currentJob}</b>.</p>
      <p class='muted mt8'>For each task, check (✓) which KSAOs are required to perform it. The KSAO with the most checks across all tasks is the most critical competency.</p>
      <div class='linkageTableContainer mt12'></div>
      <div class='row mt12'><button class='r6Calculate'>📊 Submit Linkage Table</button></div>
      <div class='r6Result'></div>`;

    // build the checkbox table
    const container = mount.querySelector('.linkageTableContainer');
    const table = document.createElement('table');
    table.className = 'linkage-table linkage-checkbox-table';

    // header row: Task | KSAO1 | KSAO2 | KSAO3 | KSAO4
    let headerHtml = '<thead><tr><th class="task-col">Task</th>';
    ksaos.forEach((k, ki) => { headerHtml += `<th class="ksao-col" title="${k}">${k}</th>`; });
    headerHtml += '</tr></thead>';

    // body rows: one per task
    let bodyHtml = '<tbody>';
    tasks.forEach((task, ti) => {
      // truncate long tasks for display
      const shortTask = task.length > 80 ? task.substring(0, 77) + '...' : task;
      bodyHtml += `<tr><td class="task-col" title="${task.replace(/"/g, '&quot;')}">${ti + 1}. ${shortTask}</td>`;
      ksaos.forEach((k, ki) => {
        bodyHtml += `<td class="ksao-check-cell"><input type="checkbox" class="linkage-cb" data-task="${ti}" data-ksao="${ki}" /></td>`;
      });
      bodyHtml += '</tr>';
    });
    // totals row
    bodyHtml += '<tr class="totals-row"><td class="task-col"><b>Total ✓</b></td>';
    ksaos.forEach((k, ki) => {
      bodyHtml += `<td class="ksao-check-cell importance-cell"><b><span class="linkage-total-cb" data-ksao-idx="${ki}">0</span></b></td>`;
    });
    bodyHtml += '</tr></tbody>';

    table.innerHTML = headerHtml + bodyHtml;
    container.appendChild(table);

    // live-update totals as checkboxes are clicked
    table.querySelectorAll('.linkage-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        ksaos.forEach((k, ki) => {
          const count = table.querySelectorAll(`.linkage-cb[data-ksao="${ki}"]:checked`).length;
          table.querySelector(`.linkage-total-cb[data-ksao-idx="${ki}"]`).textContent = count;
        });
      });
    });

    mount.querySelector('.r6Calculate').onclick = function() {
      // gather student answers
      const studentAnswers = [];
      const studentTotals = new Array(ksaos.length).fill(0);
      tasks.forEach((task, ti) => {
        const row = [];
        ksaos.forEach((k, ki) => {
          const checked = table.querySelector(`.linkage-cb[data-task="${ti}"][data-ksao="${ki}"]`).checked ? 1 : 0;
          row.push(checked);
          studentTotals[ki] += checked;
        });
        studentAnswers.push(row);
      });

      // compare to answer key
      let totalCells = tasks.length * ksaos.length;
      let correctCells = 0;
      tasks.forEach((task, ti) => {
        ksaos.forEach((k, ki) => {
          if (studentAnswers[ti][ki] === cfg.answers[ti][ki]) correctCells++;
        });
      });

      const accuracy = correctCells / totalCells;

      // check if student got the top KSAO right (highest total)
      const studentTopIdx = studentTotals.indexOf(Math.max(...studentTotals));
      const correctTopIdx = cfg.totals.indexOf(Math.max(...cfg.totals));
      const topMatch = studentTopIdx === correctTopIdx;

      let money, status, exp;
      if (accuracy >= 0.85 && topMatch) {
        money = 25000; status = 'correct';
        exp = `Excellent! You correctly identified <b>${ksaos[correctTopIdx]}</b> as the most critical KSAO (${cfg.totals[correctTopIdx]} tasks require it). Your overall accuracy was ${Math.round(accuracy * 100)}%.`;
      } else if (accuracy >= 0.65 || topMatch) {
        money = 15000; status = 'partial';
        exp = `Good effort! Your accuracy was ${Math.round(accuracy * 100)}%. The most critical KSAO is <b>${ksaos[correctTopIdx]}</b> (required for ${cfg.totals[correctTopIdx]} of 10 tasks)${!topMatch ? `, but you ranked <b>${ksaos[studentTopIdx]}</b> highest` : ''}.`;
      } else {
        money = 5000; status = 'incorrect';
        exp = `Your accuracy was ${Math.round(accuracy * 100)}%. The most critical KSAO is <b>${ksaos[correctTopIdx]}</b> (required for ${cfg.totals[correctTopIdx]} of 10 tasks). Review which tasks truly require each competency.`;
      }
      addMoney(money);

      // build comparison table
      let compHtml = '<table class="linkage-table linkage-checkbox-table mt8"><thead><tr><th class="task-col">Task</th>';
      ksaos.forEach(k => { compHtml += `<th class="ksao-col">${k}</th>`; });
      compHtml += '</tr></thead><tbody>';
      tasks.forEach((task, ti) => {
        const shortTask = task.length > 60 ? task.substring(0, 57) + '...' : task;
        compHtml += `<tr><td class="task-col">${ti + 1}. ${shortTask}</td>`;
        ksaos.forEach((k, ki) => {
          const student = studentAnswers[ti][ki];
          const correct = cfg.answers[ti][ki];
          const match = student === correct;
          const icon = match ? (correct ? '✓' : '') : (correct ? '<span class="mismatch">✗ miss</span>' : '<span class="mismatch">✗ extra</span>');
          compHtml += `<td class="ksao-check-cell" style="background:${match ? '#f0fdf4' : '#fef2f2'}">${icon}</td>`;
        });
        compHtml += '</tr>';
      });
      compHtml += '<tr class="totals-row"><td class="task-col"><b>Totals</b></td>';
      ksaos.forEach((k, ki) => {
        const match = studentTotals[ki] === cfg.totals[ki];
        compHtml += `<td class="ksao-check-cell importance-cell"><b>${studentTotals[ki]}</b> / <b>${cfg.totals[ki]}</b> ${match ? '<span class="match">✓</span>' : '<span class="mismatch">✗</span>'}</td>`;
      });
      compHtml += '</tr></tbody></table>';

      const resultDiv = mount.querySelector('.r6Result'); resultDiv.innerHTML = '';
      const fb = document.createElement('div');
      fb.className = `feedback ${status === 'correct' ? 'correct' : status === 'partial' ? 'partial' : 'incorrect'}`;
      const icon = status === 'correct' ? '✅' : status === 'partial' ? '⚠️' : '❌';
      fb.innerHTML = `<h4>${icon} ${status === 'correct' ? 'Excellent Analysis!' : status === 'partial' ? 'Good Effort' : 'Needs Work'}</h4>
        <p><b>${fmt(money)}</b></p><p class='mt8'>${exp}</p>
        <p class='mt12'><b>Comparison (your answers vs. answer key):</b></p>${compHtml}`;
      resultDiv.appendChild(fb);

      // lock everything
      table.querySelectorAll('.linkage-cb').forEach(cb => cb.disabled = true);
      this.disabled = true;
      lockRound('R6', status, `${Math.round(accuracy * 100)}% accuracy, top: ${ksaos[studentTopIdx]}`, money, exp);
    };
  }
}

function addMoney(n) {
  state.bank += n;
  updateHUD();
  const bankEl = $("#bank");
  bankEl.style.transform = 'scale(1.2)';
  bankEl.style.color = n > 0 ? 'var(--success)' : n < 0 ? 'var(--error)' : '';
  setTimeout(() => { bankEl.style.transform = 'scale(1)'; bankEl.style.color = ''; }, 500);
}

// ──────────────────────────────────────────────────
// LEARNING CHALLENGE (wrong = lose points, NO RETRIES)
// ──────────────────────────────────────────────────
function drawLearningChallenge() {
  // if all cards used, reset pool
  if (state.usedLearningCards.length >= LEARNING_CARDS.length) {
    state.usedLearningCards = [];
  }
  // pick an unused card
  let idx;
  do { idx = Math.floor(Math.random() * LEARNING_CARDS.length); }
  while (state.usedLearningCards.includes(idx));
  state.usedLearningCards.push(idx);

  const card = LEARNING_CARDS[idx];
  const box = document.createElement('div');
  box.innerHTML = `
    <div class='teachable-moment'><h4>💡 Learning Challenge</h4><p>${card.text}</p></div>
    <p class='mt12'><b>Scenario:</b> ${card.scenario}</p>
    <p class='mt12'><b>${card.question}</b></p>
    <div class='options mt12'>${card.options.map((opt, i) => `<label><input type='radio' name='cardAnswer' value='${i}' class='card-option'/> ${opt}</label>`).join('')}</div>`;

  const submitBtn = Object.assign(document.createElement('button'), { textContent: 'Submit Answer', className: 'mt12' });
  const resultDiv = document.createElement('div'); resultDiv.className = 'mt12';

  submitBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="cardAnswer"]:checked');
    if (!selected) { resultDiv.innerHTML = '<p class="muted">Please select an answer!</p>'; return; }
    const ansIdx = parseInt(selected.value);
    const isCorrect = ansIdx === card.correct;
    const money = card.rewards[ansIdx];
    const fb = document.createElement('div');
    if (isCorrect) {
      fb.className = 'feedback correct';
      fb.innerHTML = `<h4>✅ Excellent!</h4><p><b>You earned ${fmt(money)}</b></p><p class='mt8'>${card.explanation}</p>`;
    } else {
      fb.className = 'feedback incorrect';
      fb.innerHTML = `<h4>❌ Not Quite — You lose ${fmt(Math.abs(money))}!</h4>
        <p class='mt8'><b>The correct answer was:</b> ${card.options[card.correct]}</p>
        <p class='mt8'><b>Why:</b> ${card.explanation}</p>`;
    }
    addMoney(money);
    resultDiv.innerHTML = '';
    resultDiv.appendChild(fb);
    // lock — no retries
    submitBtn.disabled = true;
    document.querySelectorAll('.card-option').forEach(r => r.disabled = true);
    // allow modal to be closed now
    $("#modal").dataset.requireAnswer = 'false';
  });

  box.appendChild(submitBtn);
  box.appendChild(resultDiv);
  openModal('🎯 Learning Challenge', box);
  $("#modal").dataset.requireAnswer = 'true';
}

// ──────────────────────────────────────────────────
// RANDOM ACTION CARDS (Game of Life style with wheel)
// ──────────────────────────────────────────────────
function getRelevantActionCards() {
  return ACTION_CARDS.filter(c =>
    c.category === state.currentJob ||
    c.category === 'General' ||
    c.category === 'Job Analysis'
  );
}

function getCategoryClass(cat) {
  if (cat === 'Astronaut') return 'cat-astronaut';
  if (cat === 'Server') return 'cat-server';
  if (cat === 'Software Engineer') return 'cat-software';
  if (cat === 'Trauma Surgeon') return 'cat-surgeon';
  if (cat === 'General') return 'cat-general';
  return 'cat-jobanalysis';
}

function drawRandomActionCard() {
  const pool = getRelevantActionCards();
  const card = pool[Math.floor(Math.random() * pool.length)];
  const box = document.createElement('div');

  const catClass = getCategoryClass(card.category);
  box.innerHTML = `<div class="action-card-banner ${catClass}">🃏 Random Action — ${card.category}</div>
    <div class="action-card-body"><p>${card.text}</p></div>`;

  if (card.type === 'flat') {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'mt12';
    const fb = document.createElement('div');
    fb.className = card.money >= 0 ? 'feedback correct' : 'feedback incorrect';
    fb.innerHTML = `<h4>${card.money >= 0 ? '✅' : '❌'} ${fmt(card.money)}</h4><p>No spin needed.</p>`;
    addMoney(card.money);
    resultDiv.appendChild(fb);
    box.appendChild(resultDiv);
    openModal('🃏 Random Action Card', box);
    return;
  }

  box.innerHTML += createWheelHTML();
  const spinBtn = Object.assign(document.createElement('button'), { textContent: '🎯 Spin the Wheel!', className: 'mt8' });
  const resultDiv = document.createElement('div'); resultDiv.className = 'wheel-result';

  spinBtn.addEventListener('click', () => {
    spinBtn.disabled = true;
    const wheelContainer = box.querySelector('.wheel-container');
    spinWheelAnimation(wheelContainer, (n) => {
      let money, resultText;

      if (card.type === 'spin_range') {
        if (n <= 5) { money = card.low_money; resultText = card.low_result; }
        else { money = card.high_money; resultText = card.high_result; }
      } else if (card.type === 'multiplier') {
        money = n * card.multiplier;
        resultText = `You spun ${n}! That\u2019s ${n} × ${fmt(card.multiplier)} = ${fmt(money)}!`;
      } else if (card.type === 'job_change') {
        const newJob = jobFromSpin(n);
        state.currentJob = newJob;
        state.flashHint = `New job: ${newJob}`;
        money = 0;
        resultText = `You spun ${n}! Your new occupation is <b>${newJob}</b>!`;
        $("#roundTitle").textContent = 'Current Job';
        $("#roundBody").innerHTML = `<div class="hint">New job: ${newJob}</div>
          <p class='mt8'>You are now a <b>${newJob}</b>! Future challenges will reflect this new career.</p>`;
      }

      const fb = document.createElement('div');
      fb.className = money > 0 ? 'feedback correct' : money < 0 ? 'feedback incorrect' : 'feedback partial';
      fb.innerHTML = `<h4>You spun ${n}!</h4><p>${resultText || ''}</p><p class='mt8'><b>${money !== 0 ? (money > 0 ? 'You earn ' : 'You lose ') + fmt(Math.abs(money)) : 'No money change.'}</b></p>`;
      if (money !== 0) addMoney(money);
      resultDiv.innerHTML = '';
      resultDiv.appendChild(fb);
    });
  });

  box.appendChild(spinBtn);
  box.appendChild(resultDiv);
  openModal('🃏 Random Action Card', box);
}
