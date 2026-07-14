# HealthSphere AI 🌐

HealthSphere AI is a premium, production-ready health tracking application designed to help users lose weight, monitor nutrition, record workouts, and analyze habits using AI. Crafted with Apple-level interface polish, it features glassmorphism panels, vibrant custom charting, and full responsiveness.

---

## Repository Structure

```tree
HealthSphere/
├── apps/
│   ├── frontend/             # Next.js (TypeScript, Tailwind, Recharts, Framer Motion)
│   │   ├── src/
│   │   │   ├── app/          # App Router (pages, api routes)
│   │   │   ├── components/   # Modular dashboard views
│   │   │   └── utils/        # LocalStorage state, Supabase clients
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── backend/              # NestJS (TypeScript, Prisma ORM, Passport JWT)
│       ├── src/
│       │   ├── auth/         # JWT credentials, SSO stubs
│       │   ├── logs/         # Weight, Food, Water, Workout controllers
│       │   ├── ai/           # Gemini API integrations
│       │   └── prisma/       # DB Client services
│       ├── prisma/
│       │   └── schema.prisma # Prisma 7.0 database modeling
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml        # Multi-service composition
└── README.md
```

---

## Core Technical Features

1. **Apple Human Interface Design**: Sleek dark/light responsive interface, glass cards, fluid transitions, and customizable metric/imperial units.
2. **AI Meal Scanner**: Integrates with the **Gemini 1.5 Flash API** to classify meals, estimate grams, list ingredients, and calculate calories and macronutrients directly from photos.
3. **Interactive Recharts Engine**: Renders dynamic area, bar, and progress charts to cross-reference weight fluctuations against caloric deficits and sleep logs.
4. **Offline Sync & Caching**: Utilizes a robust LocalStorage engine with automatic level/XP gamification algorithms, ensuring the client works immediately in the browser.
5. **NestJS Microservices**: Exposes secured CRUD REST APIs for logging metrics, structured with NestJS controllers, JWT strategies, and global validation pipes.
6. **Prisma 7.0 & PostgreSQL**: Implements a complete relational database schema supporting cascade deletes and modular queries.

---

## Local Execution Instructions

### Option 1: Running with Docker Compose (Recommended)

To run the complete system (PostgreSQL database, Redis cache, NestJS backend, and Next.js frontend) in a production-like setting:

1. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://yhjalonzfwqjrjlhltuy.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Uj3pzFM5wfhbi2gilKNKmg_H4iSgTOY
   ```
2. Build and launch the containers:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Running Services Locally

#### Frontend (Next.js)
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Copy environment keys:
   - Ensure the `.env.local` contains the Supabase Publishable Key and URL.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at [http://localhost:3000](http://localhost:3000).

#### Backend (NestJS)
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Ensure you have a running PostgreSQL database and supply its URL in a local `.env` or `prisma.config.ts`.
3. Scaffold database schema and compile code:
   ```bash
   npx prisma generate
   npm run build
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```
5. The API is hosted at [http://localhost:3001/api](http://localhost:3001/api).

---

## Production Deployment Directions

### Database & Backend (Railway)
1. Connect your Github Repository to **Railway**.
2. Provision a **PostgreSQL** and **Redis** instance.
3. Deploy the `/backend` directory. Railway will automatically detect the Dockerfile, run database migrations, and expose the server port.

### Frontend (Vercel)
1. Create a new project in **Vercel** pointing to the repository.
2. Set the Root Directory parameter to `frontend`.
3. Configure the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. Vercel will build and deploy the Next.js server statically.
