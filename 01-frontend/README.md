# 📦 HoundXpress Guide Tracking System
## 🧪 Tech Stack

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux--Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled--Components-DB7093?style=flat&logo=styled-components&logoColor=white)
![React Testing Library](https://img.shields.io/badge/React%20Testing%20Library-E33332?style=flat&logo=testing-library&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222?style=flat&logo=github&logoColor=white)

## Preview
<img src="https://github.com/YisusDU/ebac-ea-m38-SEO/blob/main/houndxpress2/src/assets/IMG/preview-hx.webp" alt="general-preview">

## 📁 Overview

This document provides a **comprehensive technical overview** of the **HoundXpress guide tracking system**, a **React-based web application** for managing shipment deliveries and tracking their status throughout the delivery lifecycle.

The system enables users to:

- Register new shipment guides  
- View current status  
- Track delivery history  
- Update shipment stages via modals

This overview includes:

- High-level system architecture  
- Core functionality  
- Technology stack

> For more detailed subsystem documentation, see:
- `State Management System` – Redux implementation
- `Core Features` – Business functionality
- `User Interface Components` – Component architecture

---

## 🧭 System Overview

**HoundXpress** is a **single-page React application** that manages shipment guides through a centralized **Redux Toolkit** store. It supports three main workflows:

### 🚚 Guide Registration
Create new shipment guides with origin, destination, and recipient details.

### 📋 Guide Management
View and filter existing guides using a table-based UI.

### 🛰️ Status Tracking
Access shipment history and update delivery status via modal interfaces.

Each shipment guide maintains a **stage history** tracking its progress from **registration to delivery**, stored entirely in browser state.

> **Sources:**
- `houndxpress2/src/App/__test__/App.test.tsx` (lines 1–105)
- `houndxpress2/src/state/__tests__/guidesSlice.test.ts` (lines 1–127)

---

## 🏗️ High-Level System Architecture

> _Diagrams or explanation can be inserted here._

> **Sources:**
- `houndxpress2/src/App/__test__/App.test.tsx` (lines 35–105)
- `houndxpress2/package.json` (lines 1–54)

---

## 🔄 Core Data Flow and Guide Lifecycle

> _Insert state flow diagram or lifecycle chart if applicable._

> **Sources:**
- `houndxpress2/src/state/__tests__/guidesSlice.test.ts` (lines 17–33)
- `houndxpress2/src/state/__tests__/guidesSlice.test.ts` (lines 35–63)

---

## 🧰 Technology Stack and Project Structure

The application is built with modern React development tools and practices:

| Technology             | Version     | Purpose                              |
|------------------------|-------------|--------------------------------------|
| **React**              | ^19.1.0     | UI framework and component system    |
| **Redux Toolkit**      | ^2.8.2      | State management                     |
| **TypeScript**         | ^4.9.5      | Static typing                        |
| **Styled Components**  | ^6.1.18     | CSS-in-JS styling                    |
| **React Testing Library** | ^16.3.0  | Component testing                    |

### 🗂️ Project Structure
```
houndxpress2/
├── src/
│ ├── App/ # Root component and store config
│ ├── components/ # UI components and modals
│ ├── state/ # Redux slices and types
│ └── theme/ # Styling system and design tokens
├── package.json
├── package-lock.json
└── README.md
```


The app is configured for deployment via **GitHub Pages**:  
📍 `https://yisusdu.github.io/ebac-ea-m38-SEO/`

> **Sources:**
- `houndxpress2/package.json` (lines 5–22)

---

## 🪟 State-Driven Modal System

The application uses a **centralized modal system** driven by Redux state.

A `modalData` object in the Redux store determines:

- Which modal is active  
- Which shipment guide it's acting upon  

This pattern ensures:

- Consistent modal behavior  
- Simplified modal testing via Redux actions

> **Sources:**
- `houndxpress2/src/state/__tests__/guidesSlice.test.ts` (lines 104–124)
- `houndxpress2/src/App/__test__/App.test.tsx` (lines 94–104)

---

## 📚 Relevant Source Files

- `README.md`  
- `houndxpress2/package.json`  
- `houndxpress2/package-lock.json`  
- `houndxpress2/src/App/__test__/App.test.tsx`  
- `houndxpress2/src/components/Modals/ModalHistory/HistoryTable/styles.ts`  
- `houndxpress2/src/state/__tests__/guidesSlice.test.ts`

---

>[!Note]
>You can check the full documentation <a href="https://deepwiki.com/YisusDU/ebac-ea-m38-SEO">-here-</a>
