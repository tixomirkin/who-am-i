<div align="center">
  <img src="https://i.imgur.com/kBqzPM9.png" alt="Who am I? Logo" width="80" height="80" />
  <h1>Who am I? — Online Party Game</h1>
  <p><strong>Real-time multiplayer party game for Discord groups & friends</strong></p>

  <p>
    <a href="#about-the-project">About</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#architecture--design-patterns">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#testing">Testing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PartyKit-WebSockets-f43f5e" alt="PartyKit" />
    <img src="https://img.shields.io/badge/MobX-6.13-ff6b4a?logo=mobx&logoColor=white" alt="MobX" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/pnpm-Workspace-f69220?logo=pnpm&logoColor=white" alt="pnpm" />
    <img src="https://img.shields.io/badge/Vitest-Tested-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
  </p>
</div>

---

## 🎮 About the Project

**"Who am I?"** (Кто я?) is a real-time multiplayer guessing game designed for casual gaming sessions with friends in Discord or browser.

Each player is assigned a secret character by their opponents. Everyone can see who other players are, but your own character remains hidden! Players take turns asking questions, making deductions, and trying to guess their secret identity before anyone else.

<div align="center">
  <img src="https://i.imgur.com/aXjeatO.png" alt="Gameplay Preview" width="100%" />
</div>

---

## ✨ Key Features

- 🕵️ **Hidden Identities**: Players see each other's secret characters on virtual sticky notes while their own card remains hidden.
- ⚡ **Real-time WebSockets**: Ultra low-latency state synchronization powered by **PartyKit** (Cloudflare Workers runtime).
- 🔄 **Turn Management**: Automatic turn progression and round tracking among active participants.
- 👥 **Spectator Mode**: Join mid-game as an observer without disrupting ongoing rounds, or jump in as an active player whenever ready.
- 🎨 **Profile Customization**: In-game nicknames and instant avatar image uploads powered by the Imgur API.
- 👑 **Admin Moderation**: Room creators have host permissions with seamless fallback delegation if the host disconnects.
- 🌓 **Dark / Light Mode**: Beautiful modern UI built with Tailwind CSS and Radix UI primitives.

---

## 🏗️ Architecture & Design Patterns

The project is organized as a modern **TypeScript Monorepo** managed with **pnpm workspaces**:

```text
who-am-i/
├── apps/
│   ├── client/           # React 19 Single Page Application
│   │   ├── src/
│   │   │   ├── components/  # Decoupled UI & Game components
│   │   │   ├── hooks/       # Custom React hooks (useSocket, useGameStore)
│   │   │   ├── routes/      # TanStack Router file-based routing
│   │   │   └── store/       # MobX GameStore & SocketController
│   │   └── package.json
│   └── server/           # PartyKit WebSocket server
│       ├── party/
│       │   ├── room-state.ts       # RoomStateManager aggregate
│       │   ├── event-dispatcher.ts # Command / Dispatcher pattern
│       │   ├── media-service.ts    # Media & Imgur upload adapter
│       │   └── server.ts           # PartyKit lifecycle worker
│       └── package.json
├── packages/
│   └── shared/           # Cross-package shared library (@who-am-i/shared)
│       ├── src/
│       │   ├── constants.ts   # Game limits and configuration
│       │   ├── validation.ts  # Input validation & schema rules
│       │   └── types/         # Strongly typed protocol & game state
│       └── package.json
├── package.json          # Root orchestration scripts
└── pnpm-workspace.yaml   # Monorepo workspace configuration
```

### Applied Software Design Patterns

1. **Monorepo Architecture (`pnpm workspace`)**: Single source of truth for protocol types (`@who-am-i/shared`), ensuring 100% type safety across client and server.
2. **Command / Dispatcher Pattern (`event-dispatcher.ts`)**: Replaced conditional branching with a typed event registry for incoming WebSocket messages.
3. **Domain State Aggregate (`room-state.ts`)**: Room logic is separated from transport layers, enforcing game rules invariants (single admin, circular turn advancement, spectator isolation) and enabling isolated unit testing.
4. **Adapter / Service Pattern (`media-service.ts`)**: Imgur integration abstracted behind the `IMediaService` interface with strict MIME type and file-size validation.
5. **Reactive State Pattern (`mobx-react-lite`)**: Fine-grained reactive UI updates on the frontend with computed state properties (`isMyTurn`, `activePlayers`, `spectators`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | pnpm Workspaces, TypeScript 5.8 |
| **Frontend** | React 19, TanStack Router, MobX, Tailwind CSS v4, Radix UI, Sonner, Lucide Icons |
| **Backend** | PartyKit, Cloudflare Workers runtime, WebSockets |
| **Media & Cloud** | Imgur API, Vercel |
| **Testing & Quality** | Vitest, ESLint Flat Config, TypeScript Strict Mode |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher (tested on Node.js v22 & v25)
- **pnpm**: `v9.0.0` or higher (`corepack enable pnpm`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tixomirkin/who-am-i.git
   cd who-am-i
   ```

2. Install all dependencies across the monorepo:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   - Create `apps/client/.env`:
     ```env
     VITE_PARTY_KIT_DOMAIN=127.0.0.1:1999
     ```
   - Create `apps/server/.env` (optional, for Imgur avatar upload):
     ```env
     IMGUR_CLIENT_ID=your_imgur_client_id
     CLIENT_DOMAIN=http://localhost:5173
     ```

### Running Locally

To run both client and server concurrently:
```bash
pnpm dev
```

Or run services individually:
```bash
# Start Vite development server on http://localhost:5173
pnpm dev:client

# Start PartyKit server on http://127.0.0.1:1999
pnpm dev:server
```

---

## 🧪 Testing & Quality Checks

Run the test suite across all workspace packages:
```bash
# Run unit & integration tests with Vitest
pnpm test

# Run TypeScript type check across all packages
pnpm typecheck

# Run linter
pnpm lint

# Production build
pnpm build
```

---

## 👤 Author

Developed with ❤️ by **[@tixomirkin](https://github.com/tixomirkin)** for game nights with friends.