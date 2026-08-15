export const SAMPLE_CANDIDATES = [
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    title: "Aspiring AI/ML Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    education: "B.S. in Computer Science, State University (2024)",
    location: "San Francisco, CA (Open to Remote)",
    githubUsername: "alexrivera-ml",
    githubUrl: "https://github.com/alexrivera-ml",
    bio: "CS graduate focused on NLP & Deep Learning models. Built 8+ Python repositories with PyTorch and Scikit-Learn. Actively seeking junior to mid-level ML Engineer roles.",
    stats: {
      totalRepos: 14,
      starsCount: 128,
      commitCountYear: 684,
      topLanguage: "Python (78%)"
    },
    resumeText: `ALEX RIVERA
San Francisco, CA | alex.rivera@example.com | github.com/alexrivera-ml | linkedin.com/in/alex-rivera-ml

SUMMARY
Recent Computer Science graduate with hands-on experience developing deep learning architectures, classical machine learning pipelines, and NLP transformers. Passionate about deploying production-grade AI systems.

EDUCATION
B.S. in Computer Science | State University (Graduated May 2024, GPA: 3.8/4.0)
Relevant Coursework: Machine Learning, Deep Learning, Natural Language Processing, Distributed Systems, Data Structures & Algorithms.

TECHNICAL SKILLS
• Languages: Python (Proficient), SQL (Intermediate), C++, JavaScript (Basic)
• ML/AI: PyTorch, Scikit-Learn, Pandas, NumPy, Hugging Face Transformers, OpenCV, Matplotlib
• Databases: PostgreSQL, SQLite
• Cloud & Tools: AWS (Cloud Practitioner Certified), Git, Linux, Jupyter Notebooks

PROJECTS
NLP Multilingual Sentiment Analyzer (PyTorch, Transformers, Hugging Face)
• Fine-tuned RoBERTa on 150K multilingual tweets, achieving an 89.4% F1-score across 4 languages.
• Implemented attention weight visualization and preprocessing pipelines using Tokenizers.

Real-Time Vision Object Detection Pipeline (PyTorch, OpenCV)
• Implemented YOLOv5 object detection pipeline processing live webcam streams at 32 FPS on RTX 3070.
• Built custom data augmentation module using Albumentations for bounding box noise reduction.

Customer Churn Prediction Engine (Scikit-Learn, Pandas, SQL)
• Built gradient boosting (XGBoost/LightGBM) models on 500K customer records queried via PostgreSQL.
• Reduced false positives by 22% using SMOTE resampling and hyperparameter optimization with Optuna.

CERTIFICATIONS
• AWS Certified Cloud Practitioner (2024)`,
    
    extractedSkills: [
      { name: "Python", category: "Languages", proficiency: "Advanced", resumeMentions: 8, repoCount: 8, certified: false },
      { name: "Machine Learning", category: "AI/ML", proficiency: "Intermediate", resumeMentions: 6, repoCount: 4, certified: false },
      { name: "PyTorch", category: "AI/ML", proficiency: "Intermediate", resumeMentions: 5, repoCount: 3, certified: false },
      { name: "SQL", category: "Databases", proficiency: "Intermediate", resumeMentions: 3, repoCount: 2, certified: false },
      { name: "NLP", category: "AI/ML", proficiency: "Intermediate", resumeMentions: 4, repoCount: 1, certified: false },
      { name: "AWS", category: "Cloud/DevOps", proficiency: "Beginner", resumeMentions: 2, repoCount: 0, certified: true, certName: "AWS Cloud Practitioner" },
      { name: "PostgreSQL", category: "Databases", proficiency: "Beginner", resumeMentions: 2, repoCount: 1, certified: false },
      { name: "FastAPI", category: "Backend", proficiency: "None", resumeMentions: 0, repoCount: 0, certified: false },
      { name: "Docker", category: "Cloud/DevOps", proficiency: "None", resumeMentions: 0, repoCount: 0, certified: false }
    ],

    githubRepos: [
      {
        id: "repo-1",
        name: "nlp-multilingual-sentiment",
        description: "Fine-tuned RoBERTa transformer pipeline for multilingual sentiment classification with Hugging Face.",
        language: "Python",
        stars: 46,
        forks: 12,
        commits: 114,
        lastUpdated: "2 weeks ago",
        complexityScore: 7.8,
        hasReadme: true,
        readmeScore: 85,
        hasTests: false,
        testCoverage: 0,
        hasDocker: false,
        hasCI: false,
        techStack: ["Python", "PyTorch", "Hugging Face", "Transformers", "NumPy"],
        insights: [
          "Good model implementation with clean modular Python code",
          "Lacks automated unit tests (PyTest) for inference pipelines",
          "No Dockerfile or REST API endpoint to serve model predictions in production"
        ]
      },
      {
        id: "repo-2",
        name: "vision-object-detect-stream",
        description: "Real-time webcam video stream object detection using YOLOv5 and OpenCV.",
        language: "Python",
        stars: 32,
        forks: 7,
        commits: 88,
        lastUpdated: "1 month ago",
        complexityScore: 7.2,
        hasReadme: true,
        readmeScore: 78,
        hasTests: true,
        testCoverage: 42,
        hasDocker: false,
        hasCI: false,
        techStack: ["Python", "OpenCV", "PyTorch", "Albumentations"],
        insights: [
          "Demonstrates solid computer vision fundamentals",
          "Test coverage is low (42%) and lacks integration tests",
          "Model weights are hardcoded in the repo rather than pulled from cloud storage (S3)"
        ]
      },
      {
        id: "repo-3",
        name: "customer-churn-xgboost",
        description: "Predictive customer retention model using PostgreSQL ETL, Optuna, and XGBoost.",
        language: "Python",
        stars: 21,
        forks: 4,
        commits: 64,
        lastUpdated: "2 months ago",
        complexityScore: 6.5,
        hasReadme: true,
        readmeScore: 70,
        hasTests: false,
        testCoverage: 0,
        hasDocker: false,
        hasCI: false,
        techStack: ["Python", "Scikit-Learn", "XGBoost", "PostgreSQL", "Pandas"],
        insights: [
          "Clean data transformation scripts and metric evaluation plots",
          "Database connection credentials stored in code rather than environment variables",
          "No batch inference pipeline or scheduled automation"
        ]
      },
      {
        id: "repo-4",
        name: "rl-cartpole-dqn",
        description: "Deep Q-Network reinforcement learning agent solving OpenAI Gym CartPole environment.",
        language: "Python",
        stars: 18,
        forks: 3,
        commits: 42,
        lastUpdated: "3 months ago",
        complexityScore: 6.8,
        hasReadme: true,
        readmeScore: 82,
        hasTests: false,
        testCoverage: 0,
        hasDocker: false,
        hasCI: false,
        techStack: ["Python", "PyTorch", "Gymnasium", "Matplotlib"],
        insights: [
          "Clear mathematical explanation in README",
          "Good hyperparameter replay memory buffer implementation"
        ]
      }
    ],

    verifiedBadges: [
      { id: "b1", title: "PyTorch Practitioner", issuer: "GitHub Audit", verifiedDate: "Aug 2026", icon: "Flame" },
      { id: "b2", title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", verifiedDate: "May 2024", icon: "Cloud" },
      { id: "b3", title: "Clean Python Codebase", issuer: "ORBIT Engine", verifiedDate: "Aug 2026", icon: "Code2" }
    ],

    progressHistory: [
      { date: "May 2026", score: 54, event: "Initial Profile Evaluation" },
      { date: "Jun 2026", score: 62, event: "Completed NLP Transformer Project" },
      { date: "Jul 2026", score: 68, event: "AWS Cloud Practitioner Certified" },
      { date: "Aug 2026 (Now)", score: 72, event: "Code Quality & Repo Sync" }
    ]
  },

  {
    id: "maya-chen",
    name: "Maya Chen",
    title: "Frontend transitioning to Full-Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    education: "B.S. in Software Engineering, UC San Diego (2023)",
    location: "Seattle, WA",
    githubUsername: "mayachen-dev",
    githubUrl: "https://github.com/mayachen-dev",
    bio: "2 years building high-performance React & TypeScript applications. Transitioning into full-stack platform engineering with Node.js, Go, PostgreSQL, and Redis caching.",
    stats: {
      totalRepos: 18,
      starsCount: 342,
      commitCountYear: 940,
      topLanguage: "TypeScript (64%)"
    },
    resumeText: `MAYA CHEN
Seattle, WA | maya.chen@example.com | github.com/mayachen-dev

SUMMARY
Frontend Engineer with 2 years of professional experience in React, Next.js, and TypeScript, transitioning into Full-Stack and Platform Engineering.

EXPERIENCE
Frontend Software Engineer | SaaSify Corp (2023 - Present)
• Built and maintained enterprise UI component library using React 18, TypeScript, and Tailwind CSS.
• Optimized Core Web Vitals, improving Largest Contentful Paint (LCP) by 38% across web apps.
• Created GraphQL queries and REST client caching with TanStack Query.

TECHNICAL SKILLS
• Languages: TypeScript, JavaScript, HTML5, CSS3, Python (Basic), SQL (Basic)
• Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, Jest, Cypress
• Backend/DB: Node.js, Express, PostgreSQL (Basic), Prisma, REST APIs
• DevOps: GitHub Actions, Vercel, Docker (Basic)`,

    extractedSkills: [
      { name: "TypeScript", category: "Languages", proficiency: "Advanced", resumeMentions: 10, repoCount: 12, certified: false },
      { name: "React", category: "Frontend", proficiency: "Advanced", resumeMentions: 12, repoCount: 10, certified: false },
      { name: "Next.js", category: "Frontend", proficiency: "Advanced", resumeMentions: 6, repoCount: 5, certified: false },
      { name: "Node.js", category: "Backend", proficiency: "Intermediate", resumeMentions: 4, repoCount: 3, certified: false },
      { name: "PostgreSQL", category: "Databases", proficiency: "Beginner", resumeMentions: 2, repoCount: 1, certified: false },
      { name: "Redis", category: "Databases", proficiency: "None", resumeMentions: 0, repoCount: 0, certified: false },
      { name: "Docker", category: "Cloud/DevOps", proficiency: "Beginner", resumeMentions: 1, repoCount: 1, certified: false },
      { name: "System Design", category: "Fundamentals", proficiency: "None", resumeMentions: 0, repoCount: 0, certified: false }
    ],

    githubRepos: [
      {
        id: "repo-m1",
        name: "cloud-canvas-workspace",
        description: "Interactive real-time collaborative whiteboard built with Next.js 14, WebSockets, and Canvas API.",
        language: "TypeScript",
        stars: 184,
        forks: 32,
        commits: 240,
        lastUpdated: "3 days ago",
        complexityScore: 8.4,
        hasReadme: true,
        readmeScore: 92,
        hasTests: true,
        testCoverage: 68,
        hasDocker: false,
        hasCI: true,
        techStack: ["TypeScript", "Next.js", "WebSockets", "Tailwind CSS", "Jest"],
        insights: [
          "Outstanding UI performance and WebSocket event handling",
          "Needs Redis Pub/Sub backend for multi-server synchronization",
          "No persistent distributed storage layer"
        ]
      },
      {
        id: "repo-m2",
        name: "dev-analytics-api",
        description: "Lightweight Node.js and Express telemetry API for collecting web vitals.",
        language: "TypeScript",
        stars: 45,
        forks: 9,
        commits: 78,
        lastUpdated: "1 month ago",
        complexityScore: 6.2,
        hasReadme: true,
        readmeScore: 75,
        hasTests: true,
        testCoverage: 55,
        hasDocker: true,
        hasCI: true,
        techStack: ["Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
        insights: [
          "Has working Dockerfile and Prisma schema",
          "Lacks rate-limiting (Redis token bucket) and database indexing for high query volume"
        ]
      }
    ],

    verifiedBadges: [
      { id: "bm1", title: "TypeScript Architect", issuer: "GitHub Audit", verifiedDate: "Aug 2026", icon: "ShieldCheck" },
      { id: "bm2", title: "Frontend Performance Specialist", issuer: "ORBIT Engine", verifiedDate: "Jul 2026", icon: "Zap" }
    ],

    progressHistory: [
      { date: "May 2026", score: 65, event: "Frontend Baseline Analysis" },
      { date: "Jun 2026", score: 71, event: "Built Dev Analytics Node.js API" },
      { date: "Jul 2026", score: 76, event: "Added Docker & Prisma Integration" },
      { date: "Aug 2026 (Now)", score: 79, event: "Added CI/CD Workflow" }
    ]
  },

  {
    id: "devon-cole",
    name: "Devon Cole",
    title: "Aspiring Cloud & DevOps Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    education: "B.S. in Information Technology, Purdue (2024)",
    location: "Austin, TX",
    githubUsername: "devon-ops",
    githubUrl: "https://github.com/devon-ops",
    bio: "Passionate about Infrastructure as Code (Terraform), Kubernetes cluster orchestration, CI/CD automation, and cloud-native observability.",
    stats: {
      totalRepos: 11,
      starsCount: 88,
      commitCountYear: 512,
      topLanguage: "HCL / Terraform (48%)"
    },
    resumeText: `DEVON COLE
Austin, TX | devon.cole@example.com | github.com/devon-ops

SUMMARY
Junior Cloud & DevOps Engineer with hands-on expertise building AWS infrastructure with Terraform, multi-stage Docker builds, and GitHub Actions CI/CD pipelines.

TECHNICAL SKILLS
• Cloud: AWS (VPC, EC2, ECS, S3, IAM, CloudFront, Route53)
• IaC & Automation: Terraform, Ansible, Bash, Python scripting
• Containers & Orchestration: Docker, Kubernetes (Minikube, K3s), Helm
• CI/CD & Observability: GitHub Actions, Prometheus, Grafana, Linux`,

    extractedSkills: [
      { name: "Terraform", category: "Cloud/DevOps", proficiency: "Intermediate", resumeMentions: 6, repoCount: 4, certified: false },
      { name: "Docker", category: "Cloud/DevOps", proficiency: "Intermediate", resumeMentions: 5, repoCount: 5, certified: false },
      { name: "AWS", category: "Cloud/DevOps", proficiency: "Intermediate", resumeMentions: 8, repoCount: 3, certified: true, certName: "AWS Solutions Architect Associate" },
      { name: "Kubernetes", category: "Cloud/DevOps", proficiency: "Beginner", resumeMentions: 3, repoCount: 1, certified: false },
      { name: "CI/CD (GitHub Actions)", category: "Cloud/DevOps", proficiency: "Intermediate", resumeMentions: 4, repoCount: 4, certified: false },
      { name: "Prometheus & Grafana", category: "Cloud/DevOps", proficiency: "Beginner", resumeMentions: 2, repoCount: 1, certified: false },
      { name: "Go", category: "Languages", proficiency: "None", resumeMentions: 0, repoCount: 0, certified: false }
    ],

    githubRepos: [
      {
        id: "repo-d1",
        name: "aws-production-vpc-terraform",
        description: "Multi-tier highly available AWS VPC module with public/private subnets, NAT Gateways, and security groups in Terraform.",
        language: "HCL",
        stars: 38,
        forks: 8,
        commits: 54,
        lastUpdated: "1 week ago",
        complexityScore: 7.6,
        hasReadme: true,
        readmeScore: 88,
        hasTests: true,
        testCoverage: 60,
        hasDocker: false,
        hasCI: true,
        techStack: ["Terraform", "AWS", "HCL", "GitHub Actions", "tflint"],
        insights: [
          "Well-structured Terraform modules with variable validation",
          "Includes automated tflint checks in GitHub Actions"
        ]
      }
    ],

    verifiedBadges: [
      { id: "bd1", title: "AWS Solutions Architect", issuer: "AWS", verifiedDate: "Jun 2024", icon: "Cloud" },
      { id: "bd2", title: "Terraform Module Author", issuer: "GitHub Audit", verifiedDate: "Aug 2026", icon: "Server" }
    ],

    progressHistory: [
      { date: "May 2026", score: 60, event: "Initial DevOps Assessment" },
      { date: "Jun 2026", score: 70, event: "AWS SAA Certified" },
      { date: "Jul 2026", score: 75, event: "Published Terraform VPC Module" },
      { date: "Aug 2026 (Now)", score: 81, event: "Kubernetes Local Cluster Setup" }
    ]
  }
];
