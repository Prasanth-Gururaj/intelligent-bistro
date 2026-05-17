# The Intelligent Bistro

A Claude-powered conversational restaurant-ordering experience — built with Expo on the front, Express on the back, and Claude Sonnet 4.5 in the middle turning natural language ("add two spicy chicken sandwiches and a large water") into structured cart actions.

---

## About

The Intelligent Bistro is a take-home challenge implementation: a cross-platform mobile app (iOS / Android / Web via Expo) backed by a Node.js API. Diners can browse a 31-item menu across three categories — and they can manage their cart by tapping the UI **or** by chatting with an AI expert that understands intent and applies the right operations.

It was built against four core requirements from the challenge brief:

- **Visual Excellence** — polished, dark, cinematic glassmorphic UI. See [frontend/app/(tabs)/menu.tsx](frontend/app/(tabs)/menu.tsx), [frontend/components/BestSellerCard.tsx](frontend/components/BestSellerCard.tsx), and the design tokens in [frontend/constants/theme.ts](frontend/constants/theme.ts).
- **Conversational Logic** — Claude interprets ordering intents and returns strict JSON actions. See [backend/src/prompts/bistroPrompt.js](backend/src/prompts/bistroPrompt.js), [backend/src/services/claudeService.js](backend/src/services/claudeService.js), and [backend/src/utils/claudeResponse.js](backend/src/utils/claudeResponse.js).
- **State Management** — Zustand stores back a cart that can be mutated from both UI and AI. See [frontend/store/cartStore.ts](frontend/store/cartStore.ts), [frontend/store/menuStore.ts](frontend/store/menuStore.ts), [frontend/store/chatStore.ts](frontend/store/chatStore.ts).
- **Backend** — a small Express API that serves menu data, proxies chat to Claude, and validates the AI's structured output. See [backend/src/index.js](backend/src/index.js), [backend/src/routes/chat.js](backend/src/routes/chat.js), [backend/src/routes/menu.js](backend/src/routes/menu.js).

---

## Tech stack

| Layer    | Stack                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Mobile   | Expo ~54, React Native 0.81, React 19, Expo Router 6                           |
| State    | Zustand 5 (`menuStore`, `cartStore`, `chatStore`)                              |
| Styling  | NativeWind 4 + custom dark theme tokens ([constants/theme.ts](frontend/constants/theme.ts)) |
| Icons    | lucide-react-native                                                            |
| HTTP     | Axios                                                                          |
| Backend  | Node.js + Express 5, in-process rate limiting (30 req/min)                     |
| AI       | Anthropic SDK, `claude-sonnet-4-5`, temperature 0, max 600 tokens              |
| Data     | Static JSON ([data/menu.json](data/menu.json), [data/categories.json](data/categories.json)) + local images |

---

## Repository structure

```
bistro/
├─ frontend/                      Expo mobile app (iOS / Android / Web)
│  ├─ app/                        Expo Router screens
│  │  ├─ index.tsx                Splash + initial load
│  │  ├─ order-success.tsx        Post-checkout confirmation
│  │  └─ (tabs)/                  Bottom-tab routes: menu, chat, cart
│  ├─ components/                 MenuCard, ChatBubble, CategoryTabs,
│  │                              BestSellerCard, SuggestionCard,
│  │                              ActionSummaryCard, AISparkChip, GlassCard
│  ├─ store/                      Zustand stores (menu, cart, chat)
│  ├─ services/api.ts             Axios client: fetchMenu, fetchCategories, sendChatMessage
│  ├─ constants/theme.ts          Colors, spacing, radius, fonts
│  └─ app.json / package.json     Expo + dependency config
│
├─ backend/
│  ├─ src/
│  │  ├─ index.js                 Express entry: CORS, rate limit, /data static, route mount
│  │  ├─ routes/
│  │  │  ├─ menu.js               GET /api/menu, GET /api/categories
│  │  │  └─ chat.js               POST /api/chat
│  │  ├─ services/
│  │  │  ├─ menuService.js        Loads menu.json + categories.json from disk
│  │  │  └─ claudeService.js      Calls Claude, builds context, applies system prompt
│  │  ├─ prompts/
│  │  │  └─ bistroPrompt.js       System prompt grammar (ADD/REMOVE/UPDATE/CLEAR)
│  │  └─ utils/
│  │     └─ claudeResponse.js     JSON parsing + action validation
│  └─ .env                        ANTHROPIC_API_KEY (not committed)
│
├─ data/
│  ├─ menu.json                   31 items
│  ├─ categories.json             3 categories
│  └─ menu/                       31 product images (JPG)
│
├─ design/
│  └─ stitch_the_intelligent_bistro/
│     ├─ DESIGN.md                Full visual spec (palette, type, elevation, components)
│     └─ screens/                 Stitch mockups: splash, home/menu, chat, cart, success
│
└─ scripts/
   └─ populate-images.js          Regenerates menu imagery via Pollinations.ai
```

---

## How the AI ordering works

1. The frontend posts `{ message, cart, history }` to `POST /api/chat`.
2. [claudeService.js](backend/src/services/claudeService.js) builds the request: system prompt from [bistroPrompt.js](backend/src/prompts/bistroPrompt.js) (which defines the action grammar — `ADD`, `REMOVE`, `UPDATE`, `CLEAR` — and the suggestion contract), plus recent context (last 8 chat messages + current cart state).
3. The model is called at temperature `0` with a 600-token cap for deterministic, structured replies.
4. [claudeResponse.js](backend/src/utils/claudeResponse.js) parses the JSON, validates action shapes, and normalizes the reply text.
5. The response — `{ actions, suggestions, reply }` — flows back to the app. The app applies `actions` to `cartStore`, renders `reply` as a chat bubble, and shows `suggestions` as tap-to-send chips.

---

## API reference

| Method | Path              | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/health`         | Liveness probe                               |
| GET    | `/api/menu`       | `{ items: MenuItem[] }`                      |
| GET    | `/api/categories` | `{ categories: Category[] }`                 |
| POST   | `/api/chat`       | `{ message, cart, history }` → chat response |
| GET    | `/data/*`         | Static menu images                           |

### Shapes

```ts
interface MenuItem {
  id: string;            // e.g. "mc_002"
  name: string;
  description: string;
  price: number;
  categoryId: string;    // "starters" | "mains" | "desserts"
  image: string;         // URL or /data/menu/*.jpg path
  tags: string[];        // e.g. ["spicy","popular"]
  spiceLevel: number;    // 0–3
  dietary: string[];     // e.g. ["vegetarian"]
  pairsWith: string[];   // ids of suggested companions
  calories: number | null;
  prepTime: string;      // e.g. "10 mins"
  available: boolean;
}

interface ChatAction {
  type: 'ADD' | 'REMOVE' | 'UPDATE' | 'CLEAR';
  itemId?: string;
  itemName?: string;
  quantity?: number;
}

interface ChatResponse {
  actions: ChatAction[];
  suggestions: string[];
  reply: string;
}
```

---

## Getting started

**Prerequisites:** Node 18+, npm, an Anthropic API key, and either Expo Go on a phone or an iOS/Android simulator.

### 1. Backend

```bash
cd backend
npm install
# create backend/.env with:
#   ANTHROPIC_API_KEY=sk-ant-...
npm run dev          # nodemon on http://localhost:3001
```

Quick check: `curl http://localhost:3001/health` should return OK.

### 2. Frontend

```bash
cd frontend
npm install
npm start            # then press i (iOS), a (Android), or w (web)
```

> **LAN gotcha:** [frontend/services/api.ts](frontend/services/api.ts#L4) hard-codes `API_BASE_URL = 'http://192.168.2.142:3001'`. Update it to your machine's LAN IP when running on a physical device, or to `http://localhost:3001` for web / simulator.

---

## Environment variables

| Var                 | Where         | Required | Purpose         |
| ------------------- | ------------- | -------- | --------------- |
| `ANTHROPIC_API_KEY` | `backend/.env`| yes      | Claude API auth |

---

## Data

Menu data lives in [data/menu.json](data/menu.json) — 31 items across 8 starters, 15 mains, and 8 desserts/drinks. Each item carries `id`, `name`, `description`, `price`, `categoryId`, `image`, `tags`, `spiceLevel`, `dietary`, `pairsWith`, `calories`, `prepTime`, and `available`. Categories are in [data/categories.json](data/categories.json). Both files are read at server boot and served via `/api/menu` and `/api/categories`.

---

## Design language

The full spec lives in [design/stitch_the_intelligent_bistro/DESIGN.md](design/stitch_the_intelligent_bistro/DESIGN.md). In short: dark cinematic glassmorphism, burnt-orange (`#ffb77d`) and subtle gold (`#e9c349`) accents on near-black (`#131313`), Inter throughout, a strict 8pt grid, generous corner radii (16–32px), and AI "spark" chips highlighting featured / recommended items.

---

## Scripts

- **[scripts/populate-images.js](scripts/populate-images.js)** — regenerates food photography for every menu item via Pollinations.ai with cinematic prompts derived from each dish, then rewrites [data/menu.json](data/menu.json) with the new local paths. Handles rate-limits (waits 60s on 402/429, 3.5s on transient errors) and retries.

---

## Mapping back to the challenge

| Requirement            | Where to look                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual Excellence      | [frontend/app/(tabs)/menu.tsx](frontend/app/(tabs)/menu.tsx), [components/BestSellerCard.tsx](frontend/components/BestSellerCard.tsx), [constants/theme.ts](frontend/constants/theme.ts), [DESIGN.md](design/stitch_the_intelligent_bistro/DESIGN.md) |
| Conversational Logic   | [backend/src/prompts/bistroPrompt.js](backend/src/prompts/bistroPrompt.js), [services/claudeService.js](backend/src/services/claudeService.js), [utils/claudeResponse.js](backend/src/utils/claudeResponse.js) |
| State Management       | [frontend/store/cartStore.ts](frontend/store/cartStore.ts), [store/menuStore.ts](frontend/store/menuStore.ts), [store/chatStore.ts](frontend/store/chatStore.ts) |
| Backend                | [backend/src/index.js](backend/src/index.js), [routes/chat.js](backend/src/routes/chat.js), [routes/menu.js](backend/src/routes/menu.js)                                |
