<div align="center">
  <div style="background-color: #0d1424; padding: 20px; border-radius: 12px; display: inline-block;">
    <img src="public/vite.svg" alt="PharmIQ++ Logo" width="80" height="80" />
  </div>

  <h1 align="center">PharmIQ++</h1>

  <p align="center">
    <strong>Intelligent Pharmacy Management System</strong>
    <br />
    Precision control for modern retail pharmacies in India.
    <br />
    <a href="#features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/yourusername/pharmiq">View Demo</a>
    ·
    <a href="https://github.com/yourusername/pharmiq/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/pharmiq/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About The Project

**PharmIQ++** is a cloud-native SaaS platform designed from the ground up to handle the rigorous demands of retail pharmacy operations in India. Moving beyond legacy desktop software, PharmIQ++ brings modern UX, intelligent ML-assisted workflows, and unparalleled operational visibility to pharmacy owners.

Designed for speed, security, and true scalability, PharmIQ++ enables pharmacies to reduce stockouts, ensure strict regulatory compliance, and process point-of-sale transactions in seconds.

### Key Features

* ⚡ **Lightning Fast POS:** Process bills in split-seconds. Features keyboard-first navigation, integrated barcode scanning, and auto-batch mapping (FIFO/FEFO).
* 🛡️ **Schedule H & Regulatory Compliance:** Automated hard-blocks for prescription-only drugs unless a valid Rx is uploaded. Integrated audit trail logs for regulatory bodies.
* 🧠 **Intelligent Procurement & OCR:** Upload supplier invoices and seamlessly parse them using OCR to instantly populate inventory. Predictive stock alerts based on historical sales velocity.
* 📊 **Enterprise-Grade Analytics:** Real-time dashboards displaying gross margins, 90-day sales trends, expiry loss projections, and low-stock alerts.
* 🌓 **Beautiful, Responsive UI:** Premium dark-mode first design, built with Framer Motion, Tailwind CSS, and Shadcn UI to deliver a consumer-grade experience for enterprise data.

---

### Built With

The project leverages a completely modern, type-safe Frontend stack:

*   **Framework:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **State Management (Server):** [TanStack Query (React Query)](https://tanstack.com/query/latest)
*   **State Management (Client):** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Routing:** [React Router v6](https://reactrouter.com/)
*   **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
*   **Tables & Data Grids:** [TanStack Table v8](https://tanstack.com/table/latest)
*   **Charts & Visualizations:** [Recharts](https://recharts.org/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Node.js and npm (or pnpm/yarn) installed on your system.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/yourusername/pharmiq.git
   ```
2. Navigate to the project directory
   ```sh
   cd pharmiq
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`. You will be greeted by the Landing Page.

---

## Roadmap

- [x] High-performance POS interface
- [x] Intelligent Inventory Management
- [x] Multi-tenant SaaS architecture setup
- [ ] Backend API integration (Node.js/PostgreSQL)
- [ ] Real-time WebSocket notifications
- [ ] Integration with WhatsApp Business API for e-receipts

---

## Acknowledgments

* **Made with ❤️ by TY AIML-B Group 11 - 2026**
* UI/UX inspired by premium SaaS platforms like Stripe, Linear, and Supabase.
* Built as part of our Software Engineering Course Project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
