# ForeSite — Development Workflow

## Git Branching Strategy

### Branch Structure

```
main                    ← production, protected, no direct pushes
  └── dev               ← integration branch, merge features here daily
        ├── feature/p1-integration
        ├── feature/p2-worker-frontend
        ├── feature/p3-officer-frontend
        ├── feature/p4-maintenance-frontend
        ├── feature/p5-ai-service
        └── feature/p6-backend
```

### Rules

1. **Nobody pushes directly to `main`**
2. **Nobody pushes directly to `dev`** except P1 for integration fixes
3. All work happens in `feature/p{n}-*` branches
4. Merge to `dev` via Pull Request with at least 1 reviewer
5. `main` is only updated from `dev` once per day by P1 (usually end of day)

---

## Branch Naming Convention

```
feature/p2-worker-report-form
feature/p3-officer-dashboard
feature/p4-maintenance-task-detail
feature/p5-ai-risk-engine
feature/p6-report-api
fix/p2-form-validation-error
fix/p6-report-status-transition
```

**Format:** `feature/p{person-number}-{short-description}`

---

## Commit Message Convention

```
feat(worker): add report submission form with zod validation
fix(backend): correct role-based filtering in GET /api/reports
feat(ai): add 20 new SIF precursors to knowledge base
feat(officer): add task assignment modal
fix(maintenance): resolve status transition bug
docs: update api-contract.md with maintenance endpoint
```

**Format:** `type(scope): short description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Pull Request Rules

- Title must follow: `[P{n}] Short description of change`
- Must include: what changed, why, testing done
- Minimum 1 approver (P1 reviews all; peers can also review)
- No merge if CI fails (if CI is set up)
- Squash merge to keep `dev` history clean

---

## Conflict Prevention Rules

### Shared Files — Handle with Care

| File | Rule |
|---|---|
| `src/App.jsx` | P1 handles all route changes. Others submit route config via PR with P1 approval. Alternatively, each person adds their section clearly marked. |
| `src/components/layout/Sidebar.jsx` | Each person adds their role's menu item only. No reformatting. |
| `server/utils/constants.js` | P6 owns. No other person modifies. Open a PR and request P6 to add your constant. |
| `server/server.js` | P6 owns. Route mounts only added by P6. |
| `package.json` (root) | Discuss new packages in team chat before adding. P1 or P2/P3/P4 add frontend deps. |
| `server/package.json` | P6 owns. Backend-only dependencies. |
| `docs/*.md` | P1 owns. Changes require P1 review. |

### File Ownership Table

| File/Directory | Primary Owner | Secondary | Others |
|---|---|---|---|
| `src/pages/worker/` | P2 | P1 | No |
| `src/pages/officer/` | P3 | P1 | No |
| `src/pages/maintenance/` | P4 | P1 | No |
| `src/api/reportApi.js` | P2 | P6 | No |
| `src/api/dashboardApi.js` | P3 | P6 | No |
| `src/api/alertApi.js` | P3 | P6 | No |
| `src/api/taskApi.js` | P4 | P6 | No |
| `src/components/ui/` | P1 | Anyone | Add only, no modifying existing |
| `src/components/shared/` | P1 | Anyone | Ask before modifying |
| `src/components/charts/` | P3 | P1 | No |
| `src/components/layout/` | P1 | P2/P3/P4 (own role menu) | Limited |
| `src/stores/authStore.js` | P1 | P6 | No |
| `src/guards/` | P1 | P6 | No |
| `server/models/` | P6 | P1 | No |
| `server/routes/` | P6 | P1 | No |
| `server/controllers/` | P6 | P1 | No |
| `server/services/` | P6 | P1 | No |
| `server/middleware/` | P6 | P1 | No |
| `server/utils/constants.js` | P6 | P1 | No |
| `ai-service/` | P5 | P1 | No |
| `docs/` | P1 | Everyone | Read-only for others |
| `mock/` | P1 | Everyone | Read-only for others |
| `AGENTS.md` | P1 | — | No |

---

## Synchronization Schedule

- **Morning (start of day)**: Pull latest from `dev` into your feature branch
- **Midday (around lunch)**: Pull latest from `dev` if you know others pushed shared files
- **End of day**: Submit PR to merge your feature branch to `dev`

```bash
# Start of day routine
git checkout feature/p{n}-my-branch
git fetch origin
git merge origin/dev        # or: git rebase origin/dev
```

---

## Rebase vs Merge

- Use `merge` (not rebase) when pulling `dev` into your feature branch during development — easier to reason about for multi-developer context
- P1 uses `rebase` when cleaning up `dev → main` for demo releases

---

## Conflict Resolution Procedure

1. When you hit a conflict on a shared file, **stop and message the owner**
2. Do NOT blindly resolve conflicts in files you don't own
3. The file's owner resolves the conflict, not you
4. If owner is unavailable, contact P1

---

## Environment Configuration

### Root `.env` (frontend) — never committed
```
VITE_API_URL=http://localhost:5000/api
```

### `server/.env` — never committed
```
PORT=5000
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/foresite
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=dev-secret-key-change-in-production
```

### `ai-service/.env` — never committed
```
PORT=8000
AI_API_KEY=dev-secret-key-change-in-production
LOG_LEVEL=INFO
MODEL_NAME=all-MiniLM-L6-v2
```

### Rules
- **Never commit `.env` files** (they are in `.gitignore`)
- Use `.env.example` for sharing the structure
- Share actual secrets via secure channel (NOT Git, NOT Slack, NOT email)

---

## When to Merge to Dev

Merge to `dev` when:
- A feature is working (tested locally)
- It doesn't break existing features
- Related tests pass (if any)

Do NOT merge to `dev` when:
- The feature is incomplete or broken
- You haven't tested it
- It will definitely conflict with someone else's active work (coordinate first)
