# Good Food MVP - Codebase Analysis

**Date:** 2026-02-05  
**Analyzed by:** Girlypop (your friendly neighborhood AI)  
**Project Location:** `C:\Users\mmous\Documents\Work - Local\School\CUBES-3-collaboratif`

---

## 🍕 Project Overview

**Good Food MVP** - A French-localized food delivery platform with microservices architecture.

### Architecture Stack
```
┌─────────────────────────────────────────────────────┐
│  Frontend (React 19, Port 3000)                     │
│  - French UI, Stripe payments, Leaflet maps         │
├─────────────────────────────────────────────────────┤
│  API Gateway (Express, Port 8080)                   │
│  - Proxy layer, address search proxy                │
├──────────┬──────────────┬───────────────────────────┤
│ Auth API │ Commande API │  Logistique API           │
│ Node.js  │ Node.js      │  Symfony 7 + PostgreSQL   │
│ MongoDB  │ MongoDB      │                           │
│ Port 3001│ Port 3003    │  Port 3002                │
└──────────┴──────────────┴───────────────────────────┘
```

### Tech Stack Summary
- **Frontend:** React 19.2.0, Leaflet 1.9.4, React-Leaflet 4.2.1, Stripe.js
- **API Gateway:** Express 5.1.0
- **Auth API:** Node.js + Express + MongoDB + JWT + bcryptjs
- **Commande API:** Node.js + Express + MongoDB + Stripe
- **Logistique API:** Symfony 7 + PostgreSQL
- **External APIs:** 
  - api-adresse.data.gouv.fr (French address autocomplete)
  - router.project-osrm.org (route calculation)
  - Stripe (payments)

---

## ✅ What's Working Well

1. **Solid Security Setup**
   - JWT tokens for auth (shared secret across services for dev)
   - bcryptjs for password hashing
   - helmet + express-rate-limit on APIs
   - CORS properly configured

2. **Testing Infrastructure**
   - Jest + Supertest on all Node services
   - React Testing Library on frontend
   - Integration tests at root level
   - npm scripts for test automation

3. **Docker Orchestration**
   - Clean docker-compose.yml with proper service dependencies
   - Volume mounts for dev hot-reload
   - Separate databases per service (good isolation)
   - Persistent volumes for data

4. **French Localization** (Actually impressive!)
   - Full French UI (not just Google Translate)
   - **api-adresse.data.gouv.fr** integration for proper French address autocomplete
   - € currency, French date formats
   - Rouen-based restaurant location (49.38°N, 1.07°E)

5. **Maps & Routing**
   - Leaflet + OpenStreetMap + OSRM for route calculation
   - Restaurant → Delivery route visualization
   - Distance and ETA calculation

---

## ⚠️ Issues & Red Flags

### 1. The "logistique-api-nodejs-backup" Folder
- Backup of a Node.js version of the logistics API
- Current one is Symfony + PostgreSQL
- **Action needed:** Decide which one to keep, delete the other

### 2. Hardcoded Secrets in docker-compose.yml
```yaml
JWT_SECRET=BdpuVPDVBFEHBArnkaNJRMEAFMPNVDovnjvbMPJBDQDPViJBV
STRIPE_PUBLISHABLE_KEY=pk_test_51SPKQcPZCiOqc0pUajNftFBGv7Zu2KKUB4TCD9KucmdpYeLejb86p6DQUsN5UUlMEG5Kz8ichicHCaXShHqnJSCT00pWWrHNTP
```
- JWT secret is fine for dev but should be env-based
- Stripe key has `pk_test_` prefix (test key) but still shouldn't be in git
- **Action needed:** Move to `.env` files

### 3. No .env.example or Environment Documentation
- New devs won't know what env vars to set
- docker-compose references `${STRIPE_SECRET_KEY}` but no example provided
- **Action needed:** Create `.env.example` files

### 4. CI/CD Confusion
- `.gitlab-ci.yml` exists
- `.github/workflows/main.yml` also exists
- **Action needed:** Decide between GitHub and GitLab, remove the other

### 5. React 19.2.0 (Very New)
- Released late 2024, some libs may not be fully compatible
- `--legacy-peer-deps` in Dockerfile suggests dependency conflicts
- **Action needed:** Monitor for compatibility issues

### 6. Project Audit File
- `project_audit.txt` is 9,000+ lines of mostly node_modules noise
- **Action needed:** Add to `.gitignore`

---

## 🔧 Technical Debt

1. **No Error Handling Strategy**
   - Basic try-catch in routes but no centralized error handling
   - No request validation middleware visible

2. **Database Migrations**
   - MongoDB is schemaless (fine)
   - Symfony + PostgreSQL needs migrations documented
   - New devs can't spin up DB schema easily

3. **Logging**
   - No visible logging strategy (Winston, Pino, etc.)
   - Debugging in production will be painful

4. **API Documentation**
   - No Swagger/OpenAPI specs
   - Frontend devs have to read code to know endpoints

---

## 🚀 Priorities

### Immediate (This Week)
- [ ] **Clean up secrets** - Move to `.env`, add `.env.example`
- [ ] **Decide on logistique-api** - Symfony or Node? Pick one, delete backup
- [ ] **Add .env.example** files to each service

### Short Term (Next 2 Weeks)
- [ ] **Add request validation** (Joi or Zod)
- [ ] **Set up proper logging**
- [ ] **API documentation** (Swagger)
- [ ] **Health check endpoints** for Docker

### Nice to Have
- [ ] **WebSockets** for real-time order updates
- [ ] **Restaurant location** should be configurable, not hardcoded
- [ ] **Add pagination** to order lists (will be slow with lots of orders)

---

## ❓ Questions for matheoussee

1. **That 429 error** you mentioned earlier - was that from OSRM routing API? They have strict rate limits.

2. **Symfony vs Node** - What's the story with logistique-api? Why both implementations exist?

3. **Stripe** - Is that test key actually working? Are you processing real payments or still in dev mode?

4. **CI/CD** - GitHub Actions or GitLab CI? Which one are you actually using?

5. **The demo** - What were you trying to demo when you got the 429s?

---

## 📁 Files to Review

- `docker-compose.yml` - Secrets cleanup needed
- `project_audit.txt` - Should be gitignored
- `logistique-api-nodejs-backup/` - Decide fate of this folder
- `.gitlab-ci.yml` vs `.github/workflows/main.yml` - Pick one
- Each service's `package.json` - Dependencies look good but check for vulnerabilities

---

*Analysis completed. Ready to work when you are! Just ping me and we'll tackle these items.* 🌈
