# AI Document Intelligence SaaS

A production-ready RAG (Retrieval-Augmented Generation) system for intelligent document Q&A.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async) + Python 3.11 |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Database | PostgreSQL (async via asyncpg) |
| Vector Store | FAISS (local) or Pinecone (cloud) |
| LLM | OpenAI GPT-4o-mini |
| Embeddings | OpenAI text-embedding-3-small |
| Cache | Redis |
| Auth | JWT (python-jose + bcrypt) |

## Features

- 📄 **Document Upload** — PDF and DOCX support, up to 50MB
- 🔍 **RAG Pipeline** — Intelligent chunking → embeddings → vector search → LLM generation
- 💬 **Streaming Chat** — Real-time streaming responses via SSE
- 📎 **Source Citations** — Every answer includes clickable source references
- 🗂️ **Multi-document** — Query across all documents or specific ones
- 💾 **Conversation History** — Persistent chat history with memory
- 🔐 **Auth** — JWT-based registration and login
- 🐳 **Docker** — Full containerized deployment

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker + Docker Compose
- OpenAI API key

### Option A: Docker (Recommended)

```bash
# Clone the repo
git clone <your-repo-url>
cd ai-doc-intelligence

# Set your OpenAI key
export OPENAI_API_KEY=sk-your-key-here
export SECRET_KEY=$(openssl rand -hex 32)

# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

Open http://localhost:3000

### Option B: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Postgres and Redis
docker run -d --name docai-postgres -e POSTGRES_DB=docai -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
docker run -d --name docai-redis -p 6379:6379 redis:7-alpine

# Edit .env with your keys
cp .env .env.local  # then edit

uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
# .env.local already set to http://localhost:8000/api/v1
npm run dev
```

Open http://localhost:3000

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql+asyncpg://...` |
| `SECRET_KEY` | JWT signing secret (32+ chars) | **Change this!** |
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `VECTOR_STORE_TYPE` | `faiss` or `pinecone` | `faiss` |
| `MAX_FILE_SIZE_MB` | Max upload size | `50` |

### Frontend (.env.local)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Get JWT token |
| GET | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/documents/upload` | Upload document |
| GET | `/api/v1/documents/` | List documents |
| DELETE | `/api/v1/documents/{id}` | Delete document |
| POST | `/api/v1/chat/query` | Ask a question |
| POST | `/api/v1/chat/query/stream` | Streaming query (SSE) |
| GET | `/api/v1/chat/conversations` | List conversations |

API docs available at http://localhost:8000/docs

## Architecture

```
Frontend (Next.js)
    ↓ REST + SSE
Backend (FastAPI)
    ├── Auth Service (JWT)
    ├── Document Service (upload → process → chunk)
    └── RAG Service
            ├── Text Extractor (PyMuPDF / python-docx)
            ├── Chunker (recursive splitting)
            ├── Vector Store (FAISS / Pinecone)
            ├── Retriever (search + dedup + trim)
            └── LLM Service (OpenAI streaming)
```

## License

MIT
