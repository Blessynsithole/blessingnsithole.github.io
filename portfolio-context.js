/**
 * Portfolio Context for AI Chatbot
 * Comprehensive information about Blessing N Sithole's portfolio
 * Used as context in AI system prompts
 */

export const portfolioContext = {
  personal: {
    name: "Blessing N Sithole",
    title: "Computer Scientist",
    tagline: "I tell a computer what to do",
    description: "Digital Technology Enthusiast | Problem Solver",
    taglineDescription: "A passionate computer scientist with a strong interest in digital technology and its applications in the construction industry, bridging the gap between traditional engineering practices and modern technological solutions.",
  },

  about: {
    whoIAm: "I'm Blessing, a passionate computer scientist with a strong interest in digital technology and its applications in the construction industry. My journey has been about bridging the gap between traditional engineering practices and modern technological solutions.",
    philosophy: "Innovate, optimize, and build sustainable infrastructure and technologies for the future",
    focus: "Bridging engineering and digital technology",
  },

  education: {
    current: {
      degree: "BSc in Computer Science (Honours)",
      status: "In Progress",
      startYear: 2024,
      endYear: "Present",
      specializations: [
        "Web Development",
        "Smart Chatbots Development",
        "App Development",
        "AI & Machine Learning",
      ],
    },
    previous: [
      {
        level: "Civil Engineering",
        description: "Studied towards a Bachelor of Engineering in Civil Engineering and the built environment",
        years: "2022 - 2024",
      },
      {
        level: "High School Education",
        description: "Completed high school education focusing on Mathematics, Chemistry, and Physics",
        years: "2016 - 2021",
      },
    ],
  },

  experience: {
    summary: "1+ years of frontend web development experience | 3+ years of project management experience",
    roles: [
      {
        title: "Frontend Web Developer",
        yearsOfExperience: "1+",
        description: "Frontend web development",
      },
      {
        title: "Project Manager",
        yearsOfExperience: "3+",
        description: "Project management and coordination",
      },
    ],
  },

  expertise: [
    {
      category: "Web Development",
      icon: "fas fa-code",
      description: "Design and development of futuristic web apps using both traditional and digital methods.",
      skills: [
        "Frontend development",
        "Graphic Design",
        "Web Design",
      ],
      proficiency: "90%",
    },
    {
      category: "AI Integration",
      icon: "fas fa-robot",
      description: "Building intelligent features using machine learning models, chatbots, and data-driven decision systems for smarter user interactions.",
      skills: [
        "Natural Language Processing (NLP)",
        "Chatbot Development",
        "Predictive Analytics",
        "Machine Learning Basics",
      ],
      proficiency: "80%",
    },
    {
      category: "Cybersecurity & Authentication Systems",
      icon: "fas fa-key",
      description: "Keeping user data safe and systems secure.",
      skills: [
        "Secure Login/Registration",
        "Data Encryption",
        "Vulnerability Testing",
        "JWT & OAuth2 Authentication",
      ],
      proficiency: "75%",
    },
  ],

  specializations: {
    frontendDevelopment: {
      name: "Frontend Development",
      proficiency: "90%",
      description: "Building responsive and interactive user interfaces",
    },
    graphicDesign: {
      name: "Graphic Design",
      proficiency: "85%",
      description: "Creating visual designs and UI/UX elements",
    },
    artificialIntelligence: {
      name: "Artificial Intelligence",
      proficiency: "80%",
      description: "Implementing ML models, NLP, and intelligent systems",
    },
    projectManagement: {
      name: "Project Management",
      proficiency: "88%",
      description: "Leading and coordinating development projects",
    },
  },

  skills: {
    development: [
      {
        name: "HTML/CSS",
        proficiency: "90%",
      },
      {
        name: "JavaScript",
        proficiency: "85%",
      },
      {
        name: "React",
        proficiency: "80%",
      },
    ],
    cybersecurity: [
      {
        name: "Kali Linux",
        proficiency: "45%",
      },
      {
        name: "Wireshark",
        proficiency: "50%",
      },
      {
        name: "Nmap",
        proficiency: "55%",
      },
    ],
    otherTechnologies: [
      "Node.js",
      "MongoDB",
      "React JS",
      "APIs",
      "PWA (Progressive Web Apps)",
      "Netlify",
    ],
  },

  projects: [
    {
      name: "Smart School Timetable App",
      description: "Dynamic PWA with dark mode and multi-profile support built with React and Netlify.",
      technologies: ["React", "Netlify", "PWA"],
      status: "Completed",
      link: "https://blessynsithole.github.io/MSU-CS-Timetable/",
      type: "Web Application",
    },
    {
      name: "Advanced Task Manager",
      description: "Productivity tool featuring natural language processing and AI-powered scheduling.",
      technologies: ["JavaScript", "Node.js", "MongoDB"],
      status: "In Progress",
      link: null,
      type: "Full Stack Application",
    },
    {
      name: "Tutor Me",
      description: "Tutoring website hosting platform for tutoring and e-learning.",
      technologies: ["JavaScript", "Node.js", "MongoDB"],
      status: "In Progress",
      link: null,
      type: "E-Learning Platform",
    },
    {
      name: "AI Nutritional Chatbot",
      description: "Personalized nutritional health chatbot that lets users plan meals, achieve diet goals, and brings awareness on health choices.",
      technologies: ["React JS", "Node.js", "MongoDB"],
      status: "In Progress",
      link: null,
      type: "AI Chatbot Application",
    },
    {
      name: "Farm Track",
      description: "Personalized farm website that keeps users up to date with farm activities, record keeping, live weather updates, and an AI assistant.",
      technologies: ["React JS", "Node.js", "MongoDB", "APIs"],
      status: "In Progress",
      link: null,
      type: "Farm Management Application",
    },
  ],

  socialLinks: {
    github: {
      url: "https://github.com/Blessynsithole",
      username: "Blessynsithole",
      icon: "fab fa-github",
    },
    linkedin: {
      url: "https://www.linkedin.com/in/blessing-n-sithole-126276203/",
      username: "blessing-n-sithole-126276203",
      icon: "fab fa-linkedin",
    },
  },

  journey: [
    {
      period: "2016 - 2021",
      milestone: "High School Education",
      description: "Completed high school education with focus on Mathematics, Chemistry, and Physics.",
    },
    {
      period: "2022 - 2024",
      milestone: "Civil Engineering",
      description: "Studied towards a Bachelor of Engineering in Civil Engineering and the built environment.",
    },
    {
      period: "2024 - Present",
      milestone: "Computer Science",
      description: "Studying towards a Bachelor of Science (Honours) in Computer Science with specializations in Web Development, AI, Chatbots, and App Development.",
    },
  ],

  interestAreas: [
    "Web Development",
    "AI & Machine Learning",
    "Smart Chatbots",
    "App Development",
    "Digital Technology in Construction",
    "Cybersecurity",
    "Project Management",
  ],

  systemPromptContext: `
You are assisting Blessing N Sithole, a passionate Computer Scientist with expertise in web development, AI integration, and cybersecurity. 

Key Information:
- Name: Blessing N Sithole
- Title: Computer Scientist
- Tagline: "I tell a computer what to do"
- Current Focus: BSc in Computer Science with specializations in Web Development, Smart Chatbots Development, App Development, and AI & Machine Learning

Expertise Areas:
1. Web Development (90%) - Frontend development, graphic design, web design
2. AI Integration (80%) - NLP, chatbot development, predictive analytics, ML
3. Cybersecurity & Authentication (75%) - Secure login, data encryption, JWT/OAuth2

Technical Skills:
- Frontend: HTML/CSS (90%), JavaScript (85%), React (80%)
- Backend: Node.js, MongoDB
- AI/ML: Natural Language Processing, Chatbot Development, Predictive Analytics
- Security: Kali Linux, Wireshark, Nmap

Notable Projects:
- Smart School Timetable App (React PWA) - Completed
- Advanced Task Manager with NLP - In Progress
- Tutor Me (E-learning Platform) - In Progress
- AI Nutritional Chatbot - In Progress
- Farm Track (Smart Farm Management) - In Progress

Philosophy: "Innovate, optimize, and build sustainable infrastructure and technologies for the future"

When responding, embody Blessing's passion for bridging traditional engineering with modern technology, and maintain awareness of their specific expertise areas and projects.
  `,
};

export { portfolioContext };
