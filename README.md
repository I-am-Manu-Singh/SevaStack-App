# SevaStack Merchant & Student Platform 🏪🎓

SevaStack is a modern, high-fidelity React Native (Expo) application built to bridge the gap between verified campus merchants and university students. The platform caters to three primary roles: **Students (Customers)**, **Merchants**, and **System Administrators**, with dynamic role switching enabled for local development.

---

## 🏗️ Application Architecture

```mermaid
graph TD
    subgraph Client Layer (React Native + Expo)
        Router[Expo Router File System Routing]
        Ctx[AppContext Provider - Theme, Role, Translation]
        Hooks[Custom Hooks - useMerchantData, useSafeAreaInsets]
        Views[Tab Screens & Modular Widgets]
    end

    subgraph Database & Backend Layer (Supabase)
        Auth[Supabase Auth - User Roles & Tokens]
        DB[(PostgreSQL Database)]
        RLS[Row Level Security Policies]
    end

    Router --> Ctx
    Ctx --> Views
    Views --> Hooks
    Hooks --> DB
    Auth --> DB
    DB --> RLS
```

### 1. Frontend Framework
* **Core**: [React Native](https://reactnative.dev/) with [Expo (SDK 51+)](https://expo.dev/) and TypeScript.
* **Routing**: [Expo Router v3](https://docs.expo.dev/router/introduction/) implementing directory-based file system routing.
* **Layout**: [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) for standardized notches and edge paddings.
* **Design System**: Harmonious HSL tailwind-inspired colors (`constants/Theme.ts`), glassmorphism widgets (`components/GlassCard.tsx`), and visual micro-animations.

### 2. State & Context Management
* **Global AppContext (`lib/AppContext.tsx`)**: Manages the global state including theme (dark/light mode), user role switching (`customer` | `merchant` | `admin`), and translations.
* **Custom Data Hooks (`hooks/useMerchantData.ts`)**: Manages database sync, automatic caching, and real-time refresh states.

### 3. Backend & Security (Supabase)
* **Authentication**: Email/Password signup and session handling.
* **Row-Level Security (RLS)**: Fine-grained security policies on tables to ensure merchants can only view and modify data belonging to their business profile.
* **Data Flow**: High-performance Postgres operations combined with PostgREST endpoints.

---

## ✨ Features & Capabilities

### 🎓 1. Student / Resident View
* **Student Essentials Grid**: Quick routes to essential campus services (Mess/Tiffin, Hostels, Libraries, cab pooling, laundry queue, book printing).
* **Live Order Trackers**: Real-time status cards showing live study seat check-ins, mess delivery, and laundry progress.
* **Outstanding Dues & Ledger**: Track credit line items (Khata ledger) and upcoming booking fees across multiple local vendors.

### 🏪 2. Merchant Partner View
* **Business Type Switcher**: Toggles context metrics, layouts, and tools dynamically for specific business hubs (Barber Shop, Cab, Mess, etc.).
* **Active Bookings Manager**: Schedule appointments, update queues, assign tasks, and verify/approve bookings.
* **Inventory Control**: Alerts when supplies fall below specified limits (low stock notifications).
* **Ledger / Khata Management**: Keep tabs on students' credit lines, outstanding balances, and credit caps.

### 🛡️ 3. System Administrator View
* **Platform Overview**: Quick-glance summaries of active merchant counters, accumulated revenue, and registered student databases.
* **Platform Ledger & Billing**: Track payment collections, set subscription packages, and review newly onboarded shop profiles.

---

## 📱 Interactive Screen Map

The app is divided into 5 main tabs under `app/(tabs)/` wrapping views based on active user roles:

| Path | Screen Name | Role Adaptations |
| :--- | :--- | :--- |
| `index.tsx` | **Home Dashboard** | **Customer**: Greeting, live trackers, essentials grid, spotlights.<br>**Merchant**: Chair queues, today's revenue stats, booking scheduler.<br>**Admin**: Merchant counters, platform revenue charts, registration manager. |
| `manage.tsx` | **Management / Bookings** | **Customer**: View current and past subscriptions/tickets with cancellation support.<br>**Merchant**: Full queue planner, appointment search & filters. |
| `discover.tsx` | **Discover Hub** | **Customer**: Directory of active local services.<br>**Merchant**: Inventory tracker, expenses sheets, analytics widgets. |
| `staff.tsx` | **Staff Management** | **Merchant**: Manage, monitor, and toggle attendance states (Active/Off-Duty) of team barbers or delivery boys. |
| `profile.tsx` | **Profile & Developer Settings** | **All**: Dynamic profile card, SevaCoins reward wallets, dev mode role-switching toggle (`Switch Account Profile`). |

---

## 🛠️ Local Development & Setup

### Install Dependencies
```bash
npm install
```

### Run Project
```bash
npx expo start
```

### Database Seeding
Ensure realistic mock profiles, services, staff lists, inventory units, and notifications are populated into the remote database:
```bash
node seed.js
```
