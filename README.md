# Приложението — пълен преглед

Full-stack приложение за подкрепа и проследяване: регистрация/вход, чат с коуч, кризисна интервенция (Помощ/SURGE), статистики и реално време чрез Socket.IO. Интерфейсът е на български.

---

## Съдържание

- [Стартиране](#стартиране)
- [Конфигурация (среда)](#конфигурация-среда)
- [Структура на проекта](#структура-на-проекта)
- [Backend](#backend)
- [Frontend](#frontend)
- [Потоки в приложението](#потоки-в-приложението)
- [Скриптове](#скриптове)

---

## Стартиране

### Изисквания

- **Node.js** (препоръчително LTS)
- **MongoDB** (локално или облак, напр. Atlas)
- **npm** (или yarn/pnpm)

### 1. Клониране и зависимости

```bash
# От корена на проекта
cd backend && npm install
cd ../frontend && npm install
```

### 2. Конфигурация

- **Backend:** в `backend/` създай `.env` (виж [Конфигурация](#конфигурация-среда)).
- **Frontend:** в `frontend/` създай `.env` с поне `VITE_BACKEND_URL` (адресът на API-то).

### 3. Пусни сървърите

**Терминал 1 — backend:**

```bash
cd backend
npm start
```

Сървърът ще слуша на порта от `PORT` (по подразбирание 3000). MongoDB трябва да е достъпна на `MONGO_DB_URL`.

**Терминал 2 — frontend:**

```bash
cd frontend
npm run dev
```

Приложението ще е на адреса, който Vite показва (напр. `http://localhost:3000`).

### 4. Първо отваряне

- Отвори в браузър URL-а на frontend (напр. `http://localhost:3000`).
- Ще те пренасочи към `/login`. Можеш да се регистрираш или да влезеш.
- След вход имаш достъп до: Онбординг (при първа регистрация), Чат, Помощ (SURGE), Статистика.

---

## Конфигурация (среда)

### Backend (`.env` в `backend/`)

| Променлива | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт на HTTP сървъра | `8080` |
| `MONGO_DB_URL` | MongoDB connection string | `mongodb://localhost:27017/myapp` |
| `FRONTEND_URL` | Origin на frontend за CORS и Socket.IO | `http://localhost:3000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `JWT_ACCESS_SECRET` | Секрет за access JWT | произволен дълъг низ |
| `JWT_REFRESH_SECRET` | Секрет за refresh JWT | различен от access |

При липса на `PORT` се използва 3000. При липса на `FRONTEND_URL` в кода се допуска и `http://localhost:3000`.

### Frontend (`.env` в `frontend/`)

| Променлива | Описание | Пример |
|------------|----------|--------|
| `VITE_BACKEND_URL` | Пълен URL на API (вкл. `/api`) | `http://localhost:8080/api` |

От него автоматично се извлича и URL за Socket.IO (същият хост, без `/api`).

**Важно:** Ако backend работи на порт 8080, задай `VITE_BACKEND_URL=http://localhost:8080/api`. CORS на backend трябва да включва origin-а на frontend (напр. `http://localhost:3000`).

---

## Структура на проекта

```
Project/
├── backend/                 # Сървър: Express + MongoDB + Socket.IO
│   ├── src/
│   │   ├── config/         # MongoDB и др.
│   │   ├── constants/      # Бисквитки, JWT време, socket събития
│   │   ├── controllers/    # Auth, Register, Surge, Stats
│   │   ├── handlers/       # Socket.IO event handlers
│   │   ├── helpers/
│   │   ├── middlewares/    # requireAuth, socketAuth
│   │   ├── models/         # User, SurgeSession
│   │   ├── routes/         # /api/register, /api/auth, /api/surge, /api/stats
│   │   ├── services/       # JWT, Socket.IO сървър
│   │   └── index.js        # Входна точка
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/                # Клиент: React + Vite + TypeScript
│   ├── src/
│   │   ├── api/            # config (API_BASE_URL, SOCKET_URL), stats, surge
│   │   ├── components/     # auth, chat, crisis (SURGE), navigation, onboarding, statistics
│   │   ├── lib/            # socket.ts, utils
│   │   ├── store/          # useAuthStore, useAppStore
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── .env
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Backend

### Технологии

- **Node.js** + **Express 5**
- **MongoDB** (Mongoose)
- **JWT** (access + refresh), **bcrypt** за пароли
- **Socket.IO** за реално време
- **cookie-parser**, **cors**, **dotenv**

### Структура на `backend/src`

| Папка/файл | Описание |
|------------|----------|
| **config/** | Конфигурация за MongoDB (`mongoDB.js`) |
| **constants/** | Бисквитки (`cookies.js`), JWT време (`jwtExpireTimes.js`), socket събития (`events.js`) |
| **controllers/** | `auth.controller.js`, `register.controller.js`, `surge.controller.js`, `stats.controller.js` |
| **handlers/** | Обработчици за Socket.IO събития (`index.js` → `EVENTS`) |
| **helpers/** | Общи помощни функции |
| **middlewares/** | `requireAuth.js` (JWT + refresh по cookie/header), `socketAuth.js` (auth при Socket handshake) |
| **models/** | `user.js`, `surgeSession.js` |
| **routes/** | `index.js` (агрегира всички), `auth.js`, `register.js`, `surge.js`, `stats.js` |
| **services/** | `jwt.js`, `socket.js` (инициализация на Socket.IO сървър) |
| **index.js** | Express app, CORS, cookie-parser, `/api`, HTTP сървър, `initSocket(server)` |

### API маршрути (под `/api`)

| Метод | Път | Описание |
|-------|-----|----------|
| POST | `/api/register` | Регистрация |
| POST | `/api/auth/login` | Вход (access + refresh токени) |
| POST | `/api/auth/logout` | Изход (изчистване на refresh cookie) |
| GET | `/api/auth/me` | Текущ потребител (auth) |
| POST | `/api/auth/refresh` | Подновяване на токени (cookie/header) |
| POST | `/api/surge` | Изпращане на данни от SURGE сесия (auth) |
| GET | `/api/stats` | Статистики (дни без залагане, SURGE по седмици, urge) (auth) |
| PATCH | `/api/stats/last-gambling` | Обновяване на последно залагане (auth) |

### Модели

- **User:** `name`, `username`, `email`, `password`, `days_free`, `last_gambling_at`, `hasLogedForFirstTime`
- **SurgeSession:** `user`, `bodySensation`, `urgeRating`, `durationMs`, `completedAt`

### Socket.IO (backend)

- Инициализира се върху същия HTTP сървър в `index.js`.
- Auth чрез `socketAuthMiddleware`: `handshake.auth` с `accessToken` и/или `refreshToken`.
- При успешен handshake: `socket.userId`, `socket.user`. При auth само с refresh токен сървърът може да изпрати `REFRESH` с нови токени (ако се извика `emitRefreshedTokens`).
- Събитията се регистрират от `handlers/index.js` според `EVENTS` в `constants/events.js`.

---

## Frontend

### Технологии

- **React 19** + **TypeScript**
- **Vite 6** (сборка и dev сървър)
- **React Router DOM v7**
- **Zustand** (с persist) — auth и глобално състояние
- **Motion (Framer Motion)** — анимации
- **Tailwind CSS v4**
- **Socket.IO Client**
- **Lucide React** — икони

### Структура на `frontend/src`

| Папка/файл | Описание |
|------------|----------|
| **api/** | `config.ts` (API_BASE_URL, SOCKET_URL), `stats.ts`, `surge.ts` |
| **components/auth/** | Login, Register, ProtectedRoute, GuestRoute, LogoutButton |
| **components/chat/** | Chat, RichCard |
| **components/crisis/** | SurgeOverride, Phase1BodySensation, SensoryOverload, BreathingCircle, SocraticBubbles, ReflectionScale, crisisMonitor |
| **components/navigation/** | BottomNav (Чат, Помощ, Статистика) |
| **components/onboarding/** | Onboarding |
| **components/statistics/** | Statistics — диаграми и дни без залагане |
| **lib/** | socket.ts (Socket.IO клиент), utils.ts |
| **store/** | useAuthStore (потребител, токени), useAppStore (view, SURGE, чат, профил) |
| **types/** | TypeScript типове |
| **App.tsx** | Маршрути, защита, инициализация на сокет, BottomNav, LogoutButton, SurgeOverride |
| **main.tsx** | Входна точка на React приложението |

### Маршрути (React Router)

| Път | Описание | Защита |
|-----|----------|--------|
| `/login` | Вход | GuestRoute |
| `/register` | Регистрация (след успех → onboarding) | GuestRoute |
| `/platform/onboarding` | Онбординг | ProtectedRoute |
| `/platform/chat` | Чат | ProtectedRoute |
| `/platform/statistics` | Статистики | ProtectedRoute |
| `/platform` | Пренасочване към `/platform/chat` | — |
| `/` | Пренасочване към `/login` | — |

### Аутентикация

- **useAuthStore:** пази `user`, `accessToken`, `refreshToken`, `isAuthenticated`; `setAuth`, `setTokens`, `clearAuth`, `getAccessToken`, `getRefreshToken`. Персистира се в `localStorage` (`auth-storage`).
- **ProtectedRoute:** при липса на auth → `/login`.
- **GuestRoute:** при налична auth → пренасочване (по подразбиране `/platform/chat`, за register — `/platform/onboarding`).
- REST: `Authorization: Bearer <accessToken>`, при нужда `x-refresh-token`. При 401: `clearAuth()` и redirect към `/login`.

### Socket.IO (frontend)

- **lib/socket.ts:** `initSocket(accessToken, refreshToken)` — свързва към `SOCKET_URL` с auth; слуша `REFRESH` и обновява токените чрез `setTokens`. `disconnectSocket()` при изход; `getSocket()` за custom събития.
- Инициализация в **App.tsx:** при authenticated и наличен `accessToken` → `initSocket`; при logout/unmount → `disconnectSocket()`.

### SURGE (Помощ)

- Активира се от бутон „Помощ“ в долната навигация → `triggerSurge()`.
- **SurgeOverride:** пълноекранен поток — телесни усещания, 5-4-3-2-1 сетива, дишане (тап при издишване), съкратични въпроси, рефлексия и рейтинг на urge. Прогрес бар и изход с потвърждение.
- При завършване: POST `/api/surge`, след това `setSurgeSubmitted()` за обновяване на статистиките.
- **crisisMonitor:** проверка за кризисен език и модал с ресурси при нужда.

### Статистики

- **Statistics.tsx:** зарежда данни чрез GET `/api/stats` (access/refresh токени).
- Показва: дни без залагане, SURGE завършвания по седмици, urge рейтинг (последните 14).
- Презарежда при фокус на прозореца и при промяна на `lastSurgeSubmittedAt` (след завършена SURGE).

---

## Потоки в приложението

1. **Регистрация:** Frontend → POST `/api/register` → login → `setAuth` → navigate към `/platform/onboarding`.
2. **Вход:** Frontend → POST `/api/auth/login` → `setAuth` → navigate към `/platform/chat`; инициализация на Socket с токените.
3. **Защитени заявки:** Header `Authorization: Bearer <accessToken>`; при 401 — logout и redirect към `/login`.
4. **SURGE:** Поток в SurgeOverride → при край → POST `/api/surge` → `setSurgeSubmitted()` → статистиките могат да се презаредят.
5. **Изход:** POST `/api/auth/logout`, `clearAuth()`, `disconnectSocket()`, navigate към `/login`.

---

## Скриптове

### Backend (`backend/package.json`)

| Скрипт | Действие |
|--------|----------|
| `npm start` | Стартира сървъра с nodemon (`src/index.js`) |
| `npm test` | (няма тестове по подразбиране) |

### Frontend (`frontend/package.json`)

| Скрипт | Действие |
|--------|----------|
| `npm run dev` | Dev сървър (Vite, порт 3000) |
| `npm run build` | Production сборка |
| `npm run preview` | Преглед на production сборката |
| `npm run lint` | TypeScript проверка (`tsc --noEmit`) |
| `npm run clean` | Изтриване на `dist` |

---

Този README покрива цялото приложение: стартиране, конфигурация, структура, backend, frontend, основни потоци и скриптове. За допълнителни диаграми (напр. Mermaid), тестове или деплой може да се добави отделна секция.
