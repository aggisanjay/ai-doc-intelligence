# AI Document Intelligence

A production-ready, full-stack RAG (Retrieval-Augmented Generation) application for intelligent document Q&A. Upload PDFs and Word documents, then ask questions and get AI-powered answers with source citations.

🔗 **Live Demo:** [ai-doc-intelligence-ruddy.vercel.app](https://ai-doc-intelligence-ruddy.vercel.app)

💻 **GitHub:** [github.com/aggisanjay/ai-doc-intelligence](https://github.com/aggisanjay/ai-doc-intelligence)

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
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │  PostgreSQL  │  │      Gemini 2.0 Flash (LLM)     │   │
│  │   (Prisma)   │  │                                 │   │
│  └─────────────┘  └─────────────────────────────────┘   │
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
| Vector Store | Custom cosine-similarity index (per-user `.vec` files on disk) |
| LLM | Google Gemini 2.0 Flash |
| Auth | JWT + bcrypt |
| File Parsing | `pdf-parse` (PDF) · `mammoth` (DOCX) |

---

## Features

- **Document Upload** — PDF and DOCX support, up to 50 MB
- **RAG Pipeline** — chunk → embed → index → retrieve → generate
- **Streaming Chat** — real-time token streaming via Server-Sent Events (SSE)
- **Source Citations** — every answer references the source document and page number
- **Multi-Document Queries** — ask across all docs or a specific subset
- **Conversation History** — persistent sessions with full message history
- **Auth** — JWT-based register and login with per-user data isolation
- **Local Embeddings** — MiniLM-L6-v2 runs entirely on-device, no external embedding API needed

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| PostgreSQL | any recent version |
| Gemini API key | [aistudio.google.com](https://aistudio.google.com) |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/aggisanjay/ai-doc-intelligence.git
cd ai-doc-intelligence
```

### 2. Set up PostgreSQL

Create a database locally or use a hosted provider (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app)):

```bash
# Local example
psql -U postgres -c "CREATE DATABASE docai;"
```

### 3. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/docai
SECRET_KEY=your_random_secret_key
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your_gemini_api_key
VECTOR_STORE_PATH=./vector_stores
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
ALLOWED_ORIGINS=http://localhost:3000
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=5
MAX_CONTEXT_TOKENS=3000
```

Push the Prisma schema to create tables:

```bash
npx prisma db push
```

Start the backend:

```bash
npm run dev      # development (watch mode)
# or
npm start        # production
```

Backend runs at: `http://localhost:8000`

### 4. Set up the Frontend

```bash
cd ../frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `SECRET_KEY` | JWT signing secret — **required** | — |
| `JWT_EXPIRES_IN` | Token lifetime | `24h` |
| `GEMINI_API_KEY` | Google Gemini API key — **required** | — |
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

#### SSE Streaming Format

```
data: {"type":"sources","data":[{"documentName":"report.pdf","pageNumber":3,...}]}

data: {"type":"content","data":"The quarterly revenue "}
data: {"type":"content","data":"increased by 12%..."}

data: {"type":"done"}

# On error:
data: {"type":"error","data":"error message"}
```

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
│   │   │   └── cacheService.js     # In-memory cache
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
    └── package.json
```

---

## Development Commands

```bash
# Backend
npm run dev                # watch mode (nodemon)
npx prisma studio          # database browser GUI
npx prisma db push         # sync schema (dev)
npx prisma migrate deploy  # apply migrations (production)

# Frontend
npm run dev                # watch mode
npm run build              # production build
npm run lint               # ESLint
```

---

## Deployment

### Backend (Render / Railway)

1. Connect your GitHub repo
2. Set root directory to `backend`
3. Set build command: `npm install && npx prisma generate`
4. Set start command: `npx prisma db push && npm start`
5. Add all environment variables from the table above
6. Use a managed PostgreSQL add-on from the same platform

### Frontend (Vercel)

1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
4. Deploy

---

## License

MIT
