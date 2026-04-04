# AI Document Intelligence

A production-ready, full-stack RAG (Retrieval-Augmented Generation) application for intelligent document Q&A. Upload PDFs and Word documents, then ask questions and get AI-powered answers with source citations.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│               Frontend  (Next.js 14)                     │
│   Dashboard · Upload · Chat (streaming SSE) · Auth       │
└───────────────────────┬──────────────────────────────────┘
                        │ REST + SSE  /api/v1
┌───────────────────────▼──────────────────────────────────┐
│               Backend  (Node.js / Express)                │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Auth Service │  │ Doc Service  │  │   RAG Service   │ │
│  │  JWT+bcrypt  │  │upload·process│  │retrieve·generate│ │
│  └─────────────┘  └──────┬───────┘  └────────┬────────┘ │
│                           │                   │          │
│              ┌────────────▼───────────────────▼───────┐  │
│              │            RAG Pipeline                 │  │
│              │  textExtractor → chunker → vectorStore  │  │
│              │  (pdf-parse / mammoth)  (MiniLM-L6-v2)  │  │
│              └────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │  Gemini 2.0     │ │
│  │   (Prisma)   │  │   (cache)    │  │  Flash (LLM)    │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| State | Zustand |
| HTTP | Axios |

### Backend
| | |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | PostgreSQL via Prisma ORM |
| Embeddings | `all-MiniLM-L6-v2` — runs locally, no API key needed |
| Vector store | Custom cosine-similarity index (per-user `.vec` files) |
| LLM | Google Gemini 2.0 Flash |
| Auth | JWT + bcrypt |
| Cache | Redis (in-memory fallback if Redis is unavailable) |
| File parsing | `pdf-parse` (PDF) · `mammoth` (DOCX) |

---

## Features

- **Document upload** — PDF and DOCX support, up to 50 MB
- **RAG pipeline** — chunk → embed → index → retrieve → generate
- **Streaming chat** — real-time token streaming via Server-Sent Events
- **Source citations** — every answer references the source document and page number
- **Multi-document queries** — ask across all docs or a specific subset
- **Conversation history** — persistent sessions with full message history
- **Auth** — JWT-based register and login, per-user data isolation
- **Response caching** — Redis (or in-memory) cache for repeated queries
- **Docker** — single `docker-compose up` starts the entire stack

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| Docker + Docker Compose | any recent version |
| Gemini API key | [aistudio.google.com](https://aistudio.google.com) |

---

## Quick Start

### Option A — Docker (recommended)

```bash
git clone <your-repo-url>
cd ai-doc-intelligence

export GEMINI_API_KEY=your-gemini-api-key
export SECRET_KEY=$(openssl rand -hex 32)

docker-compose up --build -d
docker-compose logs -f backend
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health |

```bash
docker-compose down        # stop
docker-compose down -v     # stop and wipe all data
```

---

### Option B — Local development

**1. Start infrastructure**

```bash
docker run -d --name docai-postgres \
  -e POSTGRES_DB=docai -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine

docker run -d --name docai-redis -p 6379:6379 redis:7-alpine
```

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set GEMINI_API_KEY, SECRET_KEY, DATABASE_URL

npx prisma db push    # create tables
npm run dev           # http://localhost:8000
```

> **SQLite (no Postgres needed):** In `prisma/schema.prisma` set `provider = "sqlite"`,
> set `DATABASE_URL=file:./docai.db` in `.env`, then `npx prisma db push`.

**3. Frontend**

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `8000` |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `postgresql://postgres:postgres@localhost:5432/docai` |
| `SECRET_KEY` | JWT signing secret — **required in production** | — |
| `JWT_EXPIRES_IN` | Token lifetime | `24h` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `REDIS_URL` | Redis URL (falls back to in-memory if unreachable) | `redis://localhost:6379/0` |
| `VECTOR_STORE_PATH` | Directory for embedding index files | `./vector_stores` |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` |
| `MAX_FILE_SIZE_MB` | Maximum upload size | `50` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `CHUNK_SIZE` | Characters per text chunk | `1000` |
| `CHUNK_OVERLAP` | Overlap between chunks | `200` |
| `TOP_K_RETRIEVAL` | Chunks returned per query | `5` |
| `MAX_CONTEXT_TOKENS` | Approximate token budget sent to LLM | `3000` |

### Frontend — `frontend/.env.local`

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## API Reference

All endpoints are prefixed with `/api/v1`.
Authenticated endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ email, password, full_name? }` | Create account, returns JWT |
| `POST` | `/auth/login` | `{ email, password }` | Login, returns JWT |
| `GET` | `/auth/me` | — | Current user info |

### Documents

| Method | Path | Description |
|---|---|---|
| `POST` | `/documents/upload` | Upload PDF or DOCX (`multipart/form-data`, field: `file`) |
| `GET` | `/documents/` | List all documents for current user |
| `GET` | `/documents/:id` | Get a single document |
| `DELETE` | `/documents/:id` | Delete document and its vector index entries |
| `POST` | `/documents/:id/reprocess` | Re-run pipeline on a `failed` document |

Document `status` lifecycle: `pending` → `processing` → `completed` / `failed`

### Chat

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/chat/query` | `{ query, document_ids?, conversation_id? }` | Synchronous answer |
| `POST` | `/chat/query/stream` | `{ query, document_ids?, conversation_id? }` | SSE streaming answer |
| `GET` | `/chat/conversations` | — | List all conversations |
| `GET` | `/chat/conversations/:id` | — | Conversation with full message history |

#### SSE streaming format

```
data: {"type":"sources","data":[{"documentName":"report.pdf","pageNumber":3,...}]}

data: {"type":"content","data":"The quarterly revenue "}
data: {"type":"content","data":"increased by 12%..."}

data: {"type":"done"}

# On error:
data: {"type":"error","data":"error message"}
```

---

## RAG Pipeline

```
Upload
  └─▶ textExtractor      pdf-parse / mammoth
        └─▶ chunker       recursive split (~1000 chars, 200 overlap)
              └─▶ vectorStore.add    all-MiniLM-L6-v2 embeddings
                    └─▶ .vec + .meta.json  (one index per user, on disk)

Query
  └─▶ vectorStore.search  cosine similarity
        └─▶ retriever      score ≥ 0.3 · dedup · context-window trim
              └─▶ llmService     Gemini 2.0 Flash
                    └─▶ ragService    persist to Conversation
```

The embedding model downloads from Hugging Face on first start and is cached locally. No embedding API key is required.

---

## Project Structure

```
ai-doc-intelligence/
│
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express entry point, CORS, routes
│   │   ├── config.js               # All settings from environment
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT bearer middleware
│   │   ├── routes/
│   │   │   ├── auth.js             # Register, login, /me
│   │   │   ├── documents.js        # Upload, CRUD, reprocess
│   │   │   └── chat.js             # Query, stream, conversations
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── documentService.js
│   │   │   ├── ragService.js       # Orchestrates full RAG flow
│   │   │   ├── llmService.js       # Gemini sync + streaming
│   │   │   └── cacheService.js     # Redis + in-memory fallback
│   │   ├── rag/
│   │   │   ├── textExtractor.js    # PDF + DOCX parsing
│   │   │   ├── chunker.js          # Recursive text splitter
│   │   │   ├── vectorStore.js      # Embed + cosine-similarity search
│   │   │   └── retriever.js        # Filter, dedup, trim
│   │   └── utils/
│   │       ├── security.js         # JWT + bcrypt helpers
│   │       └── helpers.js          # httpError, formatFileSize
│   ├── prisma/
│   │   └── schema.prisma           # User, Document, Conversation
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/          # Document list + stats cards
    │   │   ├── upload/             # Drag-and-drop file uploader
    │   │   ├── chat/               # Streaming chat interface
    │   │   └── login/              # Register + login pages
    │   └── components/
    │       ├── chat/               # ChatInterface, MessageBubble, ChatInput
    │       └── documents/          # DocumentCard, DocumentList
    ├── Dockerfile
    └── package.json
```

---

## Production Deployment

### VPS with Docker Compose

```bash
export GEMINI_API_KEY=your-key
export SECRET_KEY=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -hex 16)
export ALLOWED_ORIGINS=https://your-domain.com

docker-compose up --build -d
```

**Nginx config:**

```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    client_max_body_size 55M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Required for SSE streaming
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```

### Railway / Render

1. Connect your GitHub repo to the platform
2. Create a **Web Service** pointing to `backend/Dockerfile`
3. Add managed **PostgreSQL** and **Redis** add-ons
4. Set all environment variables in the platform dashboard
5. Deploy — `prisma migrate deploy` runs automatically on container start

### Production checklist

- [ ] `SECRET_KEY` — generated with `openssl rand -hex 32`, never committed to git
- [ ] `ALLOWED_ORIGINS` — set to your exact frontend domain
- [ ] PostgreSQL — managed database with a strong password (not default `postgres/postgres`)
- [ ] Redis — password-protected in production
- [ ] Persistent volumes for `uploads/` and `vector_stores/`
- [ ] Nginx with SSL termination and `proxy_buffering off` for SSE
- [ ] Multi-instance scaling — swap local vector store for Pinecone or Qdrant

---

## Development Commands

```bash
# Backend
npm run dev                # watch mode (nodemon)
npx prisma studio          # database browser GUI
npx prisma db push         # sync schema without migrations (dev/SQLite)
npx prisma migrate deploy  # apply migrations (production/PostgreSQL)
npm run db:generate        # regenerate Prisma client after schema changes

# Frontend
npm run dev                # watch mode
npm run build              # production build
npm run lint               # ESLint
```

---

## License

MIT
