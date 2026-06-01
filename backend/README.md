# Primetrade.ai Backend API

REST API built with **FastAPI**, **PostgreSQL**, and **JWT authentication**.

## Stack
- **FastAPI** — modern Python web framework
- **SQLAlchemy** — ORM with PostgreSQL
- **JWT** — stateless authentication via `python-jose`
- **bcrypt** — password hashing via `passlib`
- **Pydantic v2** — request/response validation

## Setup

### 1. Create & activate virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Copy `.env.example` to `.env` and set your values:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/primetrade
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Create the database
```bash
# In psql or pgAdmin, run:
CREATE DATABASE primetrade;
```

### 5. Run the server
```bash
uvicorn app.main:app --reload
```

The server starts at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

---

## API Endpoints

### Authentication — `/api/v1/auth`
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login, returns JWT | Public |
| GET | `/me` | Get current user | Required |

### Tasks — `/api/v1/tasks`
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/` | List tasks (own / all for admin) | Required |
| POST | `/` | Create task | Required |
| GET | `/{id}` | Get task by ID | Required |
| PUT | `/{id}` | Update task | Required |
| DELETE | `/{id}` | Delete task | Required |

### Admin — `/api/v1/admin`
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users` | List all users | Admin only |

---

## Role-Based Access

- **user** — can only see and manage their own tasks
- **admin** — can see all tasks and all users

To make a user admin, update the `role` column directly in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Database Schema

```
users
  id          SERIAL PRIMARY KEY
  email       VARCHAR UNIQUE NOT NULL
  username    VARCHAR UNIQUE NOT NULL
  hashed_password VARCHAR NOT NULL
  role        VARCHAR DEFAULT 'user'
  is_active   BOOLEAN DEFAULT true
  created_at  TIMESTAMPTZ

tasks
  id          SERIAL PRIMARY KEY
  title       VARCHAR(200) NOT NULL
  description TEXT
  status      VARCHAR DEFAULT 'pending'  -- pending | in_progress | done
  owner_id    INTEGER FK → users.id
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

---

## Scalability Notes

- **API versioning** via `/api/v1/` prefix — new versions can be added without breaking existing clients
- **Modular structure** — each domain (auth, tasks, admin) is its own router module
- **Stateless JWT** — horizontally scalable, no server-side session storage
- **Connection pooling** — SQLAlchemy manages a pool; swap to `asyncpg` + async SQLAlchemy for higher throughput
- **Caching** — add Redis (`fastapi-cache2`) for frequently-read endpoints (e.g., user profile)
- **Docker** — containerize with `Dockerfile` + `docker-compose` for zero-config deployment
- **Load balancing** — run multiple uvicorn workers behind Nginx or deploy to a managed platform (Railway, Fly.io)
