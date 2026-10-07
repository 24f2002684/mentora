# Mentora &mdash; VRCF Foundation

> **Mentora** is an educational leadership, critical-thinking, and financial-aid platform built for the **VRCF Foundation**. It serves three distinct roles: **Student Scholars**, **Mentors**, and **Trustees**, powered by Socratic inquiry and competency tracking.

![Mentora Logo](public/logo.png)

---

## 🌟 Key Architecture & Highlights

- **Unified Google Sign-In**: A single login endpoint with automatic server-side role resolution against Firestore collection `access_roles`.
- **Role Isolation**: Strict server-side verification on every request. Re-verifies credentials dynamically so revoked/modified permissions take effect immediately.
- **Socratic AI Tutor**: An interactive mentor following the diagnostic loop: `Diagnose → Question → Attempt → Probe → Hint → Re-attempt → Apply → Reflect`. Powered server-side by Anthropic Claude with zero client exposure.
- **VRCF 10-Competency Framework**: Tracks Critical Thinking, Analytical Thinking, Logical Reasoning, Problem Solving, Innovative Thinking, Communication, Leadership, Digital/AI Literacy, Career Readiness, and Domain Knowledge.
- **Trustee Governance & Reporting**: Program-level metrics, cohort distribution, aggregate competency growth, and print/export executive briefs.
- **Bespoke Design System**: Custom teal minimalist aesthetic with system-level light and dark mode toggle, pill-shaped buttons, and responsive mobile collapsing navigation.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication (Google OAuth only)
- **Database**: Cloud Firestore
- **AI Engine**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Deployment**: Vercel

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm / pnpm / yarn

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mentora-vrcf.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mentora-vrcf
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mentora-vrcf.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1079262491823
NEXT_PUBLIC_FIREBASE_APP_ID=1:1079262491823:web:b9adb2168f1ca071f2905a

ANTHROPIC_API_KEY=sk-ant-...
ADMIN_EMAILS=suhailmobina95@gmail.com
```

### 3. Installation & Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Access Roles & Portals

| Portal | Access Path | Functionality |
| :--- | :--- | :--- |
| **Login** | `/` | Single Google OAuth login |
| **Pending Access** | `/access-pending` | Full-screen notice for unregistered emails |
| **Admin Panel** | `/admin` | Manage `access_roles` directory (restricted to `ADMIN_EMAILS`) |
| **Student Portal** | `/student` | Home, Vision Board (My Journey), Tasks, AI Tutor, Progress, Resources |
| **Mentor Portal** | `/mentor` | Caseload, My Students, Assign Task, Pending Reviews |
| **Trustee Portal** | `/trustee` | Program Overview, Student Roster, Printable Governance Reports |

---

## 📜 License
Developed for VRCF Foundation &middot; Financial-Aid &amp; Leadership Initiative.
