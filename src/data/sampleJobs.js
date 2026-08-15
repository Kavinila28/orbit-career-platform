export const SAMPLE_JOBS = [
  {
    id: "ml-engineer",
    title: "AI / Machine Learning Engineer",
    company: "Stripe & Scale AI Benchmark Role",
    department: "Applied AI & Intelligence Systems",
    level: "Early to Mid Level (1-3 yrs exp)",
    location: "San Francisco, CA / Remote",
    salaryRange: "$140,000 - $175,000",
    description: `We are looking for an AI/ML Engineer to build, evaluate, and productionize machine learning and NLP models. You will be responsible for creating robust data pipelines, serving models at scale with low latency, containerizing microservices, and deploying on cloud infrastructure.`,
    requiredSkills: [
      { name: "Python", category: "Languages", weight: 0.20, importance: "Required", minRepos: 3, description: "Idiomatic Python, async/await, data processing, object-oriented design." },
      { name: "Machine Learning", category: "AI/ML", weight: 0.18, importance: "Required", minRepos: 2, description: "Classical ML (XGBoost, Scikit-Learn), model evaluation metrics, cross-validation." },
      { name: "SQL", category: "Databases", weight: 0.12, importance: "Required", minRepos: 1, description: "Complex queries, aggregations, window functions, and relational schema design." },
      { name: "NLP", category: "AI/ML", weight: 0.15, importance: "Required", minRepos: 1, description: "Transformer architectures, embeddings, tokenization, Hugging Face models." },
      { name: "FastAPI", category: "Backend", weight: 0.15, importance: "Required", minRepos: 1, description: "High-throughput async REST API serving, Pydantic schemas, dependency injection." },
      { name: "Docker", category: "Cloud/DevOps", weight: 0.10, importance: "Required", minRepos: 1, description: "Multi-stage Dockerfiles, container optimization, environment isolation." },
      { name: "AWS", category: "Cloud/DevOps", weight: 0.10, importance: "Required", minRepos: 1, description: "S3, EC2/ECS or SageMaker, IAM permissions, cloud model deployment." }
    ],
    preferredSkills: [
      { name: "PyTorch", category: "AI/ML", weight: 0.05, importance: "Preferred", minRepos: 1, description: "Deep learning model fine-tuning, tensor operations, CUDA." },
      { name: "Redis", category: "Databases", weight: 0.03, importance: "Preferred", minRepos: 1, description: "In-memory caching and job queue brokering (Celery/RQ)." },
      { name: "CI/CD", category: "Cloud/DevOps", weight: 0.02, importance: "Preferred", minRepos: 1, description: "Automated testing and linting via GitHub Actions." }
    ],
    responsibilities: [
      "Fine-tune and benchmark NLP and ML models for classification and extraction tasks.",
      "Wrap inference models into production-ready FastAPI microservices with sub-50ms latency.",
      "Containerize ML services using Docker and manage deployments to AWS cloud.",
      "Collaborate with backend engineering to optimize SQL queries and feature stores."
    ]
  },

  {
    id: "fullstack-engineer",
    title: "Full-Stack Platform Engineer",
    company: "Uber & Airbnb Benchmark Role",
    department: "Core Platform & Experiences",
    level: "Mid Level (2-4 yrs exp)",
    location: "Seattle, WA / Remote",
    salaryRange: "$150,000 - $185,000",
    description: `Seeking a Full-Stack Engineer to build scalable web applications, real-time collaboration engines, and resilient backend microservices. You will work across modern React/TypeScript frontends and high-performance Node/PostgreSQL backends.`,
    requiredSkills: [
      { name: "TypeScript", category: "Languages", weight: 0.20, importance: "Required", minRepos: 3, description: "Advanced static typing, generics, strict mode." },
      { name: "React", category: "Frontend", weight: 0.18, importance: "Required", minRepos: 3, description: "Hooks, state machines, performance profiling, memoization." },
      { name: "Node.js", category: "Backend", weight: 0.16, importance: "Required", minRepos: 2, description: "Async I/O, event loops, RESTful & WebSocket API development." },
      { name: "PostgreSQL", category: "Databases", weight: 0.14, importance: "Required", minRepos: 2, description: "ACID transactions, query profiling, indexing (B-Tree, GIN), schema migrations." },
      { name: "Redis", category: "Databases", weight: 0.12, importance: "Required", minRepos: 1, description: "Distributed caching, rate-limiting algorithms, Pub/Sub channels." },
      { name: "Docker", category: "Cloud/DevOps", weight: 0.10, importance: "Required", minRepos: 1, description: "Containerized local environments and production images." },
      { name: "System Design", category: "Fundamentals", weight: 0.10, importance: "Required", minRepos: 0, description: "High availability, load balancing, caching tiers, data consistency." }
    ],
    preferredSkills: [
      { name: "Next.js", category: "Frontend", weight: 0.05, importance: "Preferred", minRepos: 1, description: "App Router, SSR, Edge Middleware, ISR caching." },
      { name: "GraphQL", category: "Backend", weight: 0.03, importance: "Preferred", minRepos: 1, description: "Schema definition, resolvers, DataLoader N+1 prevention." }
    ],
    responsibilities: [
      "Architect and ship real-time interactive user interfaces with TypeScript and React.",
      "Design robust database schemas and optimize PostgreSQL queries under load.",
      "Implement multi-layer caching with Redis and maintain high service availability."
    ]
  },

  {
    id: "devops-engineer",
    title: "Cloud & DevOps Infrastructure Engineer",
    company: "Datadog & Cloudflare Benchmark Role",
    department: "Site Reliability & Cloud Platform",
    level: "Early to Mid Level (1-3 yrs exp)",
    location: "Austin, TX / Remote",
    salaryRange: "$135,000 - $170,000",
    description: `Join our Cloud Platform team to build resilient cloud foundations, automate CI/CD release pipelines, manage Kubernetes clusters, and scale Infrastructure as Code across multi-region AWS environments.`,
    requiredSkills: [
      { name: "AWS", category: "Cloud/DevOps", weight: 0.22, importance: "Required", minRepos: 2, description: "VPC, IAM, ECS/EKS, S3, CloudWatch, Route53." },
      { name: "Terraform", category: "Cloud/DevOps", weight: 0.20, importance: "Required", minRepos: 2, description: "IaC state management, reusable modules, multi-environment setups." },
      { name: "Docker", category: "Cloud/DevOps", weight: 0.18, importance: "Required", minRepos: 2, description: "Multi-stage builds, security scanning, rootless containers." },
      { name: "Kubernetes", category: "Cloud/DevOps", weight: 0.16, importance: "Required", minRepos: 1, description: "Deployments, Services, Ingress controllers, Helm charts." },
      { name: "CI/CD (GitHub Actions)", category: "Cloud/DevOps", weight: 0.14, importance: "Required", minRepos: 2, description: "Automated pipelines, secrets management, canary deployments." },
      { name: "Prometheus & Grafana", category: "Cloud/DevOps", weight: 0.10, importance: "Required", minRepos: 1, description: "Metrics scraping, PromQL queries, SLO/SLA dashboards, alert rules." }
    ],
    preferredSkills: [
      { name: "Go", category: "Languages", weight: 0.05, importance: "Preferred", minRepos: 1, description: "Systems programming, CLI utilities, Kubernetes operators." },
      { name: "Linux", category: "Fundamentals", weight: 0.05, importance: "Preferred", minRepos: 0, description: "Kernel tuning, networking (iptables, DNS), shell automation." }
    ],
    responsibilities: [
      "Provision and maintain multi-tier AWS infrastructure using Terraform.",
      "Build continuous integration and delivery pipelines with automated rollback.",
      "Monitor cluster telemetry and establish automated anomaly alerting."
    ]
  }
];
