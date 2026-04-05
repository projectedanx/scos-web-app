<!-- /// file: architecture.md /// -->
Root: React/Vite
├── Auth: Firebase — OAuth
├── DB: Firestore — Document Store
├── API: Cloud Functions — REST
├── UI: Tailwind — Shadcn/Radix
└── Infra: Firebase Hosting / Python Swarm

DATA FLOWS:
User → [Auth] → [API] → [DB] → [API] → [UI]

MEREOLOGICAL MAP:
[Component] ∈ [Service] ∈ [Module] ∈ [Root]
