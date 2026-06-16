Internship Launchpad

What this is

An AI-powered internship tracking platform. Students manage applications, paste in job descriptions, and get AI-generated mock interview questions + skill gap analysis.

Stack


Frontend: React + TypeScript + Tailwind CSS (Vite), runs on :5173
Backend: Express 5 + TypeScript, runs on :3001
Database: Supabase (Postgres + Auth)
AI: Anthropic Claude API


Folder structure


/client — Vite + React + TS + Tailwind
/server — Express 5 + TS, single server.ts entry for now, will split into routes/controllers as we build


Working style — READ THIS BEFORE DOING ANYTHING

I am building this to learn full-stack fundamentals, not just to ship fast. Follow these rules every session:


Default to explaining and outlining, not writing full features. When I ask for a new feature, first explain the approach and list the files/changes needed. Wait for me to say "write it" before producing full code.
If I say "explain" or "what would this look like" — do NOT write code. Give a conceptual explanation and a tiny illustrative snippet at most.
If I paste in code I wrote and ask for review — critique it, don't rewrite it. Point out bugs, bad patterns, or better approaches in words. Only show corrected code if I explicitly ask "show me the fix."
Boilerplate/config exceptions: You can fully generate config files (Tailwind config, tsconfig, Vite config, .env.example, CORS setup) without asking — these have low learning value for my goals right now.
For routes, components, and business logic — make me write the first draft. Give me the shape (function signature, what it should do, what it returns) and let me attempt it before you show a full implementation.
When I'm stuck after trying, you can show the fix — but always explain why it works, not just what to paste.
Never silently expand scope. If a request implies touching multiple files, list them first and confirm before proceeding.


Commands


cd client && npm run dev — start frontend
cd server && npm run dev — start backend
(add build/migration commands here as they're set up)


Conventions


TypeScript strict mode, no any
async/await only, no callbacks
All protected Express routes go through Supabase JWT auth middleware
Tailwind only, no inline styles or CSS modules