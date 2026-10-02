# Smart Traffic Violation Logger 🚦

A modern, full-stack, local-first web application for recording traffic violations, issuing digital e-challans with cryptographic QR verification, tracking vehicle infraction histories, and processing payment status settlements.

Built with **React**, **TypeScript**, and **Tailwind CSS** on the frontend, and **Python**, **Flask**, **SQLAlchemy**, and **SQLite** on the backend.

---

## 🚀 Quick Start Commands

### 1. Run Backend (Flask API)

Open a terminal in the project root:

```powershell
cd backend
python app.py
```

> **Backend URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)  
> The SQLite database (`traffic_violations.db`) initializes and seeds sample traffic violations automatically on first launch!

### 2. Run Frontend (React + Vite)

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

> **Frontend Portal**: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Demo Officer Credentials

Use either account to log in to the Enforcement Portal:

| Role | Username | Password | Badge Number |
| :--- | :--- | :--- | :--- |
| **Traffic Officer** | `officer` | `traffic123` | `TP-8842` |
| **Inspector / Admin** | `admin` | `admin123` | `TP-1001` |

*(Quick autofill buttons are also provided directly on the `/login` screen for fast testing!)*

---

## 🏛️ Public Citizen Verification (No Login Required)

Anyone scanning a challan QR code or navigating directly to the public status page can view live, verified challan details without needing officer credentials:

- Public Route: `/public/challan/<challan-id>`
- Example: [http://localhost:5173/public/challan/CH-20260925-A101](http://localhost:5173/public/challan/CH-20260925-A101)

Citizens can also click **"Pay Challan Online"** on the public page to simulate settling their fine immediately, which updates the database record from **UNPAID → PAID** in real time!

---

## 📦 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Tailored light government/traffic palette, glassmorphism)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: Custom modern toast notification system

### Backend
- **Framework**: Python 3.13 + Flask
- **ORM & Database**: SQLAlchemy + SQLite (`backend/traffic_violations.db`)
- **QR Generation**: Python `qrcode` library with `Pillow` (produces high-res base64 data URIs & direct image endpoints)
- **Authentication**: JWT token generation with secure PBKDF2/Werkzeug password hashing
- **CORS**: Flask-CORS configured for local development

---

## 🛠️ Features & Architecture

1. **Traffic Violation Logger**:
   - Complete input validation (vehicle plate normalization, fine amounts > 0, dates, violation classifications).
   - Smart fine amount auto-fill recommendations based on violation type (e.g. No Helmet = ₹1,000; Overspeeding = ₹2,000; Drunk Driving = ₹10,000).
   - Instant cryptographic QR code creation linked strictly to the public status page.

2. **Real Database Dashboard**:
   - Live KPI stat cards (Total Violations, Today's Violations, Paid Violations, Unpaid Violations).
   - Financial tracking (Total Collected Fines vs. Outstanding Dues).
   - Violation classification distribution breakdown computed directly from SQLite queries.
   - 7-day enforcement trend chart.
   - Recent violations table with quick status transitions.

3. **Violation History, Search & Multi-facet Filtering**:
   - Live search by vehicle plate or Challan ID.
   - Filter by date range (from/to), payment status (All, Paid, Unpaid), and violation classification.
   - Vehicle violation history modal: look up any vehicle number to see its complete lifetime record, total unpaid count, and aggregate dues.

4. **Digital Printable Challan**:
   - Official government receipt format with security watermarks, compliance instructions, barcode & QR token layout.
   - Clean printable view (`window.print()`) that removes UI chrome.

5. **Safe Confirmation Interactions**:
   - Confirmation dialog before toggling status UNPAID → PAID.
   - Confirmation dialog preventing accidental deletion of violation records.

6. **Skeleton Loading & Empty States**:
   - Shimmering skeleton loaders for statistics, tables, and challan views.
   - Informative empty states when filters produce zero results.

---

## 📂 Project Structure

```text
traffic/
├── backend/
│   ├── app.py                  # Flask entrypoint & blueprint registration
│   ├── config.py               # Configuration & SQLite database path
│   ├── models.py               # SQLAlchemy models (Officer, Violation)
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   ├── routes/
│   │   ├── auth.py             # Officer login & me endpoints
│   │   ├── violations.py       # CRUD operations, status patch, QR generation
│   │   ├── vehicles.py         # Vehicle history lookup
│   │   ├── dashboard.py        # Real-time SQLite statistics
│   │   └── public.py           # Public QR challan verification & citizen payment
│   └── utils/
│       ├── auth.py             # JWT token handling & decorators
│       ├── qr_generator.py     # QR code rendering (base64 & PNG)
│       ├── validators.py       # Payload validation & penalty rates
│       └── seed.py             # SQLite seeding script
│
├── frontend/
│   ├── index.html              # HTML shell & font definitions
│   ├── vite.config.ts          # Vite build configuration
│   ├── tailwind.config.js      # Custom light theme palette & glassmorphism
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, Header, Table, Modal, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Dashboard, History, Create, Detail, Challan, Public
│   │   ├── services/           # API fetch service layer
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── App.tsx             # Route declarations & route guards
│   │   ├── index.css           # Ambient background & glass utilities
│   │   └── main.tsx            # Root React mount
└── README.md
```

---

## 🧪 Testing & API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status check | No |
| `POST` | `/api/auth/login` | Officer authentication | No |
| `GET` | `/api/dashboard/stats` | Aggregated SQLite analytics | No |
| `GET` | `/api/violations` | Paginated violations with filters | No |
| `POST` | `/api/violations` | Create violation & generate QR | Officer |
| `GET` | `/api/violations/<id>` | Single violation details | No |
| `PUT` | `/api/violations/<id>` | Update violation details | Officer |
| `PATCH` | `/api/violations/<id>/status` | Update payment status | Optional |
| `DELETE` | `/api/violations/<id>` | Delete violation record | Officer |
| `GET` | `/api/vehicles/<num>/history` | Vehicle violation history | No |
| `GET` | `/api/public/challan/<id>` | Public QR verification | **No** |
| `POST` | `/api/public/challan/<id>/pay`| Citizen payment settlement | **No** |
