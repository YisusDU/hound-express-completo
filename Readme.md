
# Hound Express Tracking Platform

## Preview

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=flat&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST-092E20?style=flat&logo=django&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled_Components-v6-DB7093?style=flat&logo=styled-components&logoColor=white)

![1763511168051](image/Readme/1763511168051.png)

A comprehensive logistics and tracking Single-Page Application (SPA) built with React and TypeScript, integrated with a Django REST Framework backend for real-time package management.

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Core Components](#-core-components)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Installation](#-installation)
- [Documentation](#-documentation)

## 🏗 System Architecture

Full-Stack architecture decoupling frontend and backend:

- Client-side routing (React Router)
- Centralized state management with **Sectorized Redux State**
- Component-based UI structure with strict TypeScript typing
- REST API integration (Django REST Framework)

## 🧩 Core Components

| Component         | Purpose                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `GuideRegister` | Form for creating new shipment guides with server-side validation |
| `GuideList`     | Data grid displaying all shipments with multi-criteria filtering  |
| `HistoryPath`   | Visual timeline of a package's status history                     |
| `UpdateForm`    | Modal interface for updating package status (Admin flows)         |
| `Header`        | Responsive sticky navigation with scroll-padding logic            |

**Custom Hooks:**

- `useGuideRegister` - Handles form submission and sectorized error parsing
- `useFixedHeader` - Manages sticky header behavior and visual transitions
- `useUpdateForm` - Logic for status updates and optimistic UI
- `useDraggTable` - UX enhancement for horizontal scrolling on mobile

## 🛠 Tech Stack

**Frontend:**

- React 18 (Functional Components + Hooks)
- TypeScript (Static Typing & Interfaces)
- Redux Toolkit (Global State & Thunks)
- Styled Components (CSS-in-JS & Theming)

**Backend Integration:**

- Django REST Framework (API)
- Axios (HTTP Client with Interceptors)

**Tooling:**

- Create React App (Boilerplate)
- GitHub Pages (Deployment)
- ESLint + Prettier (Code Quality)

## ✨ Features

### 📦 State Sectorization Pattern

Implemented a robust Redux state structure to avoid state collision between async operations (Create, List, Update).

```typescript
// guides.slice.ts
export interface GuidesState {
  guides: ApiGuidePayload[];
  // Sectorized Statuses to prevent collision
  listStatus: string;   // For fetching the table
  createStatus: string; // For the registration form
  updateStatus: string; // For status updates
  stagesStatus: string; // For history timeline
}
```


### 🔍 Multi-Criteria Filtering

Advanced filtering logic using `useMemo` to chain search conditions efficiently (Status + Tracking Number).

**TypesScript**

```typescript
const filteredGuides = useMemo(() => {
  const cleanState = filterState.toLowerCase();
  const cleanNumber = filterNumber.toLowerCase();
  let temp = guides;

  // Chain filters
  if (cleanState) temp = temp.filter(g => g.current_status.toLowerCase() === cleanState);
  if (cleanNumber) temp = temp.filter(g => g.guide_number.toLowerCase().includes(cleanNumber));

  return temp;
}, [guides, filterState, filterNumber]);
```

> [!Note]
> You can check the full documentation [Here](https://deepwiki.com/YisusDU/hound-express-completo)
