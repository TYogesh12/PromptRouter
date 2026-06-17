# 🚀 NexusAI — Intelligent AI Routing Engine

> An intelligent, cost-optimized AI assistant that dynamically routes every prompt to the most appropriate language model based on complexity — delivering GPT-4-level answers when needed, and blazing-fast cheap responses when they're not.

---

## 📸 Overview

NexusAI is a full-stack, production-grade AI application built for **cost efficiency and architectural sophistication**. Instead of blindly sending every prompt to the most powerful (and expensive) model, it uses a custom-trained ML classifier to evaluate complexity and hot-swap the underlying LLM on a per-prompt basis — all invisibly to the user.

This project was engineered as a demonstration of advanced AI systems design, multi-tenant SaaS architecture, and real-world full-stack development.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🧠 **Complexity Classifier** | Custom scikit-learn ML model (TF-IDF + Logistic Regression) trained to label prompts as `simple`, `moderate`, or `hard` |
| ⚡ **Dynamic Model Routing** | Llama 3.1 8B (simple) → Llama 3.3 70B (moderate) → Gemini 2.5 Flash (hard) |
| 💬 **Stateful Conversations** | Full multi-turn thread architecture with PostgreSQL-backed memory |
| 🧵 **Context Window Manager** | Injects the last 5 conversation turns as context — model-agnostically, across hot-swapped LLMs |
| 💰 **Real-Time Cost Tracking** | Per-prompt cost calculation and savings vs. always using the premium model |
| 🔐 **Multi-Tenant Auth** | Supabase JWT authentication with ES256 asymmetric key verification |
| 📊 **Routing Analytics** | Per-response stats: model used, latency, token count, and cost savings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│         Next.js Frontend         │
│  (React, Tailwind v4, TypeScript)│
└────────────────┬────────────────┘
                 │ REST API (JWT Auth)
                 ▼
┌─────────────────────────────────┐
│         FastAPI Backend          │
│                                 │
│  ┌──────────────────────────┐   │
│  │    Prompt Classifier     │   │
│  │  (scikit-learn / pickle) │   │
│  └───────────┬──────────────┘   │
│              │ complexity label  │
│  ┌───────────▼──────────────┐   │
│  │      Router Engine       │   │
│  │  simple → Llama 3.1 8B   │   │
│  │  moderate → Llama 3.3 70B│   │
│  │  hard → Gemini 2.5 Flash │   │
│  └───────────┬──────────────┘   │
│              │                  │
│  ┌───────────▼──────────────┐   │
│  │  Context Window Builder  │   │
│  │  (fetches thread history)│   │
│  └───────────┬──────────────┘   │
└──────────────┼──────────────────┘
               │
   ┌───────────▼───────────┐
   │   Supabase (PostgreSQL) │
   │  - users               │
   │  - threads             │
   │  - prompts (logs)      │
   └────────────────────────┘
```

---

## 🗄️ Database Schema

### `threads`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique thread ID |
| `user_id` | UUID (FK) | Owner of the conversation |
| `title` | String | Auto-generated from first message |
| `created_at` | DateTime | Thread creation timestamp |

### `prompts`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique log entry ID |
| `user_id` | UUID (FK) | Owner |
| `thread_id` | UUID (FK, nullable) | Parent conversation thread |
| `prompt` | String | User's input |
| `response` | String | LLM's output |
| `predicted_complexity` | String | `simple` / `moderate` / `hard` |
| `model_used` | String | The LLM that handled this turn |
| `input_tokens` | Integer | Tokens consumed by the prompt |
| `output_tokens` | Integer | Tokens consumed by the response |
| `estimated_cost` | Numeric | Actual API call cost in USD |
| `savings` | Numeric | Cost saved vs. always using Gemini 2.5 Flash |
| `response_time` | Numeric | End-to-end latency in seconds |
| `created_at` | DateTime | Timestamp |

---

## 🧠 The Routing Logic

Every prompt goes through a 3-stage pipeline:

**1. Classify** → The ML model converts the prompt into a TF-IDF vector and predicts a complexity label.

**2. Fetch Context** → If a `thread_id` is provided, the last 5 exchanges are retrieved from PostgreSQL and assembled into a conversation history array.

**3. Route & Execute** → The appropriate client (`call_groq` or `call_gemini`) is invoked with the full context window. The model completes seamlessly, having full awareness of the prior conversation — even if different models handled previous turns.

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- `@supabase/supabase-js`

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic v2
- `supabase` Python SDK (JWT verification)
- `groq` SDK (Llama models)
- `google-genai` SDK (Gemini)

**ML**
- scikit-learn (Logistic Regression + TF-IDF Vectorizer)
- pickle (model serialization)

**Infrastructure**
- Supabase (PostgreSQL + Auth)

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Supabase project

### 1. Clone & Install

```bash
# Backend
python -m venv .venv
.venv/Scripts/Activate.ps1   # Windows
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` in the project root:
```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_JWT_SECRET=...
SUPABASE_ANON_KEY=sb_publishable_...
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Run

```bash
# Terminal 1 — Backend
uvicorn backend.app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/prompt` | Submit a prompt (with optional `thread_id`) |
| `GET` | `/api/history` | Fetch all user prompt logs |
| `POST` | `/api/threads` | Create a new conversation thread |
| `GET` | `/api/threads` | Fetch all user threads |

---

## 🔮 Future Implementations

### 1. 👍 User Feedback Loop — Improving Classifier Accuracy

**The Problem:** The current ML classifier is trained on a static dataset. Over time, real-world prompts may drift in pattern — causing the classifier to occasionally mislabel a complex prompt as simple (or vice versa), routing it to a suboptimal model.

**The Solution:** A closed-loop active learning pipeline:

1. **Capture Signal** — Add 👍 / 👎 thumbs rating buttons to each AI response in the UI. The rating is stored in Postgres alongside the `prompt`, `predicted_complexity`, and `model_used`.

2. **Identify Misroutes** — A background job periodically queries for prompts where:
   - The complexity was `simple` but the user rated 👎 (likely needed a smarter model)
   - The complexity was `hard` but the user rated 👍 on a simple follow-up 

3. **Build a Correction Dataset** — These disagreements are accumulated as labeled training samples. A human-in-the-loop review panel (or automated heuristic) confirms the corrected label.

4. **Retrain the Classifier** — The corrected samples are merged into the training corpus and the scikit-learn model is retrained and re-serialized automatically.

5. **Hot-Reload** — The FastAPI server reloads the new `classifier.pkl` without downtime using a model registry pattern.

```
User gives 👎 → stored in DB
    ↓
Nightly cron job queries disagreements
    ↓
Correction pipeline labels them
    ↓
Training corpus updated
    ↓
New model.pkl serialized
    ↓
FastAPI hot-reloads classifier
    ↓
More accurate routing 🎯
```

### 2. 📊 Analytics Dashboard
- Usage trends over time (prompts/day, costs/day)
- Per-model utilization pie charts
- Cumulative cost savings tracker
- Complexity distribution histogram

### 3. 🔄 Streaming Responses
- Replace the current blocking response with Server-Sent Events (SSE) for token-by-token streaming, giving real-time "typing" feel from the LLM.

### 4. 🌐 Multi-Model Expansion
- Support for Anthropic Claude (complex reasoning tasks)
- Support for Mistral (cost-efficient European alternative)
- A/B testing framework to evaluate new models against existing routing decisions

### 5. 🔒 Team & Organization Accounts
- Multi-user workspaces with shared thread access
- Per-user spending limits and quota management
- Admin dashboard for organization-wide cost oversight

---

## 📁 Project Structure

```
LLM/
├── backend/
│   └── app/
│       ├── config.py              # Environment variable loader
│       ├── main.py                # FastAPI app + CORS + routers
│       ├── database/
│       │   └── db.py              # SQLAlchemy engine + session
│       ├── models/
│       │   ├── db_model.py        # ORM: Thread, Prompt tables
│       │   └── schemas.py         # Pydantic request/response models
│       ├── routes/
│       │   └── prompt.py          # API endpoints
│       └── services/
│           ├── auth.py            # JWT verification via Supabase SDK
│           ├── classifier.py      # ML model loader & predict()
│           ├── cost.py            # Cost & savings calculation
│           ├── llm_clients.py     # Groq + Gemini API wrappers
│           └── router.py          # Core routing orchestrator
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx         # Root layout
│       │   ├── page.tsx           # Main Chat UI
│       │   └── login/page.tsx     # Authentication page
│       └── lib/
│           ├── api.ts             # API client functions
│           └── supabase.ts        # Supabase client
└── ml/                            # ML training scripts & datasets
```

---

## 👤 Author

**Yogeshthangella** — Built as a portfolio project demonstrating production-grade AI systems engineering, full-stack SaaS development, and intelligent cost optimization at the infrastructure level.
