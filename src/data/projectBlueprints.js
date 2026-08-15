export const PROJECT_BLUEPRINTS = [
  {
    id: "fastapi-ml-serving-gateway",
    targetSkills: ["FastAPI", "Docker", "AWS", "Machine Learning"],
    title: "High-Throughput ML Model Inference Gateway",
    summary: "Production-grade asynchronous model serving REST API built with FastAPI, Pydantic validation, Redis request queueing, multi-stage Docker containerization, and AWS ECS Fargate deployment.",
    difficulty: "Intermediate to Advanced",
    estimatedTimeToBuild: "7 - 10 days (15-20 hours)",
    whyThisMatters: "Directly solves the critical gap where candidates have trained models in Jupyter notebooks but have zero evidence of serving them under production concurrency, container constraints, or cloud hosting.",
    impactOnReadiness: "+16 Points",
    architecture: {
      client: "Client / Frontend Application",
      gateway: "FastAPI Async Reverse Proxy (Pydantic v2 validation, Token Auth)",
      queue: "Redis In-Memory Queue (Background Batch Processing)",
      worker: "PyTorch/ONNX Runtime Inference Worker (CUDA/CPU batching)",
      storage: "AWS S3 (Model Artifacts & Log Storage)",
      monitoring: "Prometheus Metrics (/metrics endpoint for latency & throughput)"
    },
    repoStructure: [
      "ml-inference-gateway/",
      "├── .github/workflows/ci.yml        # Automated PyTest & Docker build CI",
      "├── app/",
      "│   ├── api/routes/                # /v1/predict, /v1/health, /v1/batch",
      "│   ├── core/config.py             # Pydantic Settings & env variables",
      "│   ├── models/schemas.py          # Request/Response validation",
      "│   ├── services/inference.py      # ONNX/PyTorch async runner",
      "│   └── main.py                    # FastAPI entrypoint & middleware",
      "├── tests/                         # PyTest suite with 85%+ coverage",
      "│   ├── test_api.py",
      "│   └── test_inference.py",
      "├── Dockerfile                     # Multi-stage slim build (<180MB)",
      "├── docker-compose.yml             # FastAPI + Redis + Mock S3 (MinIO)",
      "├── pyproject.toml",
      "└── README.md                      # Architecture diagram, benchmarks, curl examples"
    ],
    milestones: [
      {
        step: 1,
        title: "FastAPI REST API & Pydantic Validation",
        tasks: [
          "Create `/v1/predict` endpoint accepting structured JSON with text/tensor payloads.",
          "Implement Pydantic models for strict input validation, type coercion, and error responses.",
          "Add asynchronous request handling and non-blocking batch inference queues."
        ]
      },
      {
        step: 2,
        title: "Model Loading & Optimization with ONNX Runtime",
        tasks: [
          "Export fine-tuned PyTorch / Hugging Face model to ONNX format for 3.4x faster inference.",
          "Implement singleton model loader with warm-up run on application startup event."
        ]
      },
      {
        step: 3,
        title: "Production Dockerization & Multi-Stage Builds",
        tasks: [
          "Write multi-stage `Dockerfile` using `python:3.11-slim` with separate builder and runner.",
          "Ensure image security by creating non-root execution user.",
          "Configure healthcheck instructions (`HEALTHCHECK CMD curl -f http://localhost:8000/health`)."
        ]
      },
      {
        step: 4,
        title: "Cloud Deployment (AWS ECS / App Runner) & CI/CD",
        tasks: [
          "Set up GitHub Actions to run PyTest, build Docker image, and push to AWS ECR.",
          "Deploy container to AWS ECS Fargate or App Runner with HTTPS custom domain."
        ]
      }
    ],
    resumeBullets: [
      "Engineered an asynchronous ML inference gateway with FastAPI and ONNX Runtime, reducing p95 latency by 45% (sub-35ms).",
      "Containerized microservice with multi-stage Docker builds, reducing image footprint from 1.2GB to 165MB.",
      "Established CI/CD pipeline in GitHub Actions with automated PyTest unit tests achieving 88% test coverage.",
      "Deployed scalable container cluster on AWS ECS with auto-scaling triggers based on CPU and request queues."
    ]
  },

  {
    id: "redis-distributed-rate-limiter",
    targetSkills: ["Redis", "PostgreSQL", "System Design", "Node.js"],
    title: "Distributed Rate-Limiting & Caching Engine",
    summary: "High-throughput token-bucket rate limiter and caching layer built with Redis Lua scripts, PostgreSQL connection pooling, and automated benchmark load testing.",
    difficulty: "Intermediate",
    estimatedTimeToBuild: "5 - 7 days (12-15 hours)",
    whyThisMatters: "Proves hands-on backend and systems engineering depth beyond simple CRUD applications, demonstrating understanding of race conditions, Redis atomic operations, and database query optimization.",
    impactOnReadiness: "+14 Points",
    architecture: {
      client: "Simulated 10,000 req/sec Concurrent Load (Autocannon / k6)",
      gateway: "Express / Fastify Middleware Layer",
      cache: "Redis Cluster (Atomic Lua Scripts for sliding window & token bucket)",
      database: "PostgreSQL with B-Tree & Hash Indexing + Connection Pool (PgBouncer)",
      observability: "Grafana Dashboard monitoring cache hit/miss ratio & latency"
    },
    repoStructure: [
      "distributed-rate-limiter/",
      "├── .github/workflows/test.yml",
      "├── src/",
      "│   ├── middleware/rateLimiter.ts",
      "│   ├── scripts/tokenBucket.lua",
      "│   ├── db/pool.ts",
      "│   └── server.ts",
      "├── tests/integration.test.ts",
      "├── docker-compose.yml",
      "└── README.md"
    ],
    milestones: [
      {
        step: 1,
        title: "Atomic Redis Lua Script Implementation",
        tasks: [
          "Implement Sliding Window Counter algorithm in Redis Lua script to prevent boundary burst exploits.",
          "Add tiered limiters (Per-IP, Per-API Key, and Global Burst)."
        ]
      },
      {
        step: 2,
        title: "PostgreSQL Query Indexing & Connection Pooling",
        tasks: [
          "Create relational schema with composite indexes on `(user_id, created_at)`.",
          "Run `EXPLAIN ANALYZE` benchmarks demonstrating 10x query speedup with proper indexing."
        ]
      }
    ],
    resumeBullets: [
      "Architected distributed rate-limiter using Redis Lua scripts, handling 15,000+ requests/sec with zero race conditions.",
      "Optimized PostgreSQL query performance with composite B-Tree indexes, reducing 99th percentile query time from 280ms to 18ms."
    ]
  },

  {
    id: "kubernetes-gitops-observability-stack",
    targetSkills: ["Kubernetes", "Prometheus & Grafana", "CI/CD (GitHub Actions)"],
    title: "Production Kubernetes GitOps & Observability Stack",
    summary: "Declarative Infrastructure as Code pipeline deploying microservices onto a Kubernetes cluster with Helm charts, ArgoCD GitOps sync, Prometheus scraping, and Grafana alerting.",
    difficulty: "Advanced",
    estimatedTimeToBuild: "8 - 12 days (18-24 hours)",
    whyThisMatters: "Bridges the gap from simple local Docker to enterprise-grade Kubernetes orchestration, zero-downtime rolling deployments, and SRE observability.",
    impactOnReadiness: "+15 Points",
    architecture: {
      gitops: "ArgoCD watching Git repository for desired state",
      cluster: "Kubernetes (Kind / EKS) with Ingress NGINX & Cert-Manager",
      monitoring: "Prometheus Operator + Grafana Dashboards + Alertmanager",
      workloads: "Stateless Microservices with Horizontal Pod Autoscaling (HPA)"
    },
    repoStructure: [
      "k8s-gitops-observability/",
      "├── .github/workflows/lint-and-validate.yml",
      "├── helm-charts/",
      "│   └── api-service/             # Templates: deployment, service, ingress, hpa",
      "├── argocd-apps/",
      "├── monitoring/",
      "│   ├── prometheus-rules.yaml",
      "│   └── dashboards/api-metrics.json",
      "└── README.md"
    ],
    milestones: [
      {
        step: 1,
        title: "Helm Chart Engineering & Resource Limits",
        tasks: [
          "Write reusable Helm chart with parameterized values, CPU/Memory requests, and liveness/readiness probes.",
          "Configure Horizontal Pod Autoscaler (HPA) targeting 70% CPU threshold."
        ]
      },
      {
        step: 2,
        title: "Prometheus Monitoring & Alerting",
        tasks: [
          "Instrument custom PromQL alert rules for HTTP 5xx error rate spikes (>1% over 5m).",
          "Build comprehensive Grafana dashboard tracking request rate, error rate, and duration (RED metrics)."
        ]
      }
    ],
    resumeBullets: [
      "Developed production Helm charts and Kubernetes manifests with automated Horizontal Pod Autoscaling (HPA).",
      "Implemented full-stack observability with Prometheus and Grafana, establishing automated Slack alerts for SLO violations."
    ]
  }
];
