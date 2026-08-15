export const SAMPLE_INTERVIEW_QUESTIONS = [
  {
    id: "q-ml-1",
    candidateId: "alex-rivera",
    jobId: "ml-engineer",
    repoGrounding: "nlp-multilingual-sentiment",
    topic: "NLP Inference Optimization & Architecture",
    difficulty: "Mid Level",
    question: "In your 'nlp-multilingual-sentiment' repository, you fine-tuned RoBERTa on 150K multilingual tweets. How did you handle tokenization bottlenecks and dynamic sequence lengths? If we need to deploy this model as a microservice receiving 500 requests/second under 50ms latency (as required by Stripe's ML Engineer role), how would you architect the serving pipeline?",
    contextNote: "Based directly on Alex's GitHub repository 'nlp-multilingual-sentiment' and the target job's FastAPI/low-latency requirement.",
    rubric: {
      technicalAccuracy: "Candidate explains dynamic batching, ONNX Runtime/TensorRT conversion, token padding strategies, and async worker decoupling.",
      systemDesign: "Understands why raw PyTorch eager mode in Python GIL will choke at 500 req/s, recommends FastAPI with Celery/Redis queue or Triton Inference Server.",
      evidenceConnection: "References their RoBERTa model implementation decisions and acknowledges the trade-offs of sequence length truncation vs chunking."
    },
    hints: [
      "Consider using ONNX Runtime with quantization (FP16 or INT8).",
      "Explain how FastAPI's async event loop interacts with CPU/GPU heavy inference tasks.",
      "Discuss dynamic batching to group incoming async requests into tensor batches."
    ],
    sampleModelAnswer: `To serve RoBERTa under 50ms at 500 req/sec:
1. **Model Optimization**: I would export the fine-tuned RoBERTa model to ONNX with FP16 precision. This bypasses the Python interpreter overhead and enables graph optimizations (e.g. attention layer fusion), reducing inference time by ~3-4x.
2. **Serving Architecture**: Rather than running raw PyTorch inside a synchronous Flask/FastAPI worker, I would use FastAPI as an async gateway that validates requests with Pydantic and pushes payloads to a lightweight queue or directly to an optimized inference runtime like Triton Inference Server or Ray Serve.
3. **Dynamic Batching**: Incoming async requests arriving within a 5-10ms window are dynamically batched together into a single matrix multiplication pass on the GPU/CPU, maximizing hardware throughput.
4. **Tokenization Optimization**: Use Hugging Face's Rust-backed 'FastTokenizers' with hard max length truncation (e.g. 128 tokens for tweets) and bucket-based padding so short sentences aren't padded to 512 tokens unnecessarily.`
  },
  {
    id: "q-ml-2",
    candidateId: "alex-rivera",
    jobId: "ml-engineer",
    repoGrounding: "customer-churn-xgboost",
    topic: "Data Pipeline, Feature Drift & SQL Aggregation",
    difficulty: "Mid Level",
    question: "In your 'customer-churn-xgboost' repo, you queried customer records via PostgreSQL and used SMOTE resampling. In a live production system, how would you detect and handle feature drift in real-time? How would you structure SQL window functions to compute rolling 30-day user activity features without causing database table locks?",
    contextNote: "Grounded in Alex's customer churn repository and the target role's SQL & production ML requirements.",
    rubric: {
      technicalAccuracy: "Covers Population Stability Index (PSI) or Kolmogorov-Smirnov test for drift detection; uses Postgres read-replicas and non-blocking indexing.",
      systemDesign: "Understands batch vs real-time feature computation tradeoffs.",
      evidenceConnection: "Connects to their Optuna tuning and PostgreSQL ETL experience."
    },
    hints: [
      "Mention statistical metrics for drift like PSI or Wasserstein distance.",
      "Explain how SQL window functions like `AVG(amount) OVER (PARTITION BY user_id ORDER BY trans_date RANGE BETWEEN INTERVAL '30 days' PRECEDING AND CURRENT ROW)` work."
    ],
    sampleModelAnswer: `1. **Feature Drift Detection**: I would compute the Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) statistic on incoming inference features compared to the baseline training distribution. If PSI > 0.2, trigger an automated alert and retrain workflow.
2. **SQL Window Functions**: To compute rolling 30-day features efficiently without table locks, I would query a PostgreSQL read-replica using:
\`\`\`sql
SELECT user_id, transaction_date,
       COUNT(*) OVER w as tx_count_30d,
       AVG(amount) OVER w as avg_spend_30d
FROM transactions
WINDOW w AS (
    PARTITION BY user_id 
    ORDER BY transaction_date 
    RANGE BETWEEN INTERVAL '30 days' PRECEDING AND CURRENT ROW
);
\`\`\`
3. **Index Optimization**: Ensure a composite index on \`(user_id, transaction_date)\` exists to enable index-only scans and prevent expensive disk sorts.`
  },
  {
    id: "q-fs-1",
    candidateId: "maya-chen",
    jobId: "fullstack-engineer",
    repoGrounding: "cloud-canvas-workspace",
    topic: "Distributed State, WebSockets & Redis Pub/Sub",
    difficulty: "Senior / Mid Level",
    question: "In 'cloud-canvas-workspace', you built real-time collaborative canvas editing using WebSockets. When scaling from a single server to a multi-node Kubernetes cluster behind a load balancer, how do you handle WebSocket connection state and canvas cursor synchronization across nodes?",
    contextNote: "Directly grounded in Maya's Next.js WebSocket whiteboard and the target job's Redis / Distributed Systems requirements.",
    rubric: {
      technicalAccuracy: "Recommends Redis Pub/Sub or Redis Streams for inter-node message routing; explains sticky sessions vs stateless socket gateways.",
      systemDesign: "Addresses CRDT / Operational Transformation for conflict resolution in concurrent canvas edits.",
      evidenceConnection: "Mentions canvas rendering optimizations and state serialization."
    },
    hints: [
      "Explain Redis Pub/Sub adapters (like socket.io-redis or custom Redis subscribers).",
      "Mention CRDTs (Conflict-Free Replicated Data Types) like Yjs or Automerge for concurrent edits."
    ],
    sampleModelAnswer: `To scale the collaborative whiteboard across multiple server instances:
1. **Inter-Node Message Bus**: Implement a Redis Pub/Sub adapter. When User A (connected to Node 1) draws a path, Node 1 publishes the delta event to a Redis channel (\`canvas:{room_id}\`). Nodes 2 and 3 are subscribed to that room channel and broadcast the update down their active client WebSockets.
2. **Conflict Resolution (CRDTs)**: Use Yjs or Automerge data structures over WebSockets rather than sending raw coordinate arrays. CRDTs guarantee mathematical convergence of canvas objects without central server locks even during temporary network partitions.
3. **State Persistence**: Snapshot canvas state periodically (e.g. every 30s or on room exit) into PostgreSQL as compressed binary JSON/protobuf, with Redis caching the active canvas state for immediate loading when new users join.`
  }
];
