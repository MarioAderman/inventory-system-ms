# 🧾 Inventory System

A full-stack inventory management system built with:

- ⚛️ **Frontend:** React.js + Tailwind CSS
- 🖥️ **Backend:** Express.js (Node.js)
- 🗃️ **Database:** PostgreSQL

---

## 📁 Project Structure

```text
  .
    ├── backend/ # Express.js server 
    ├── frontend/ # React frontend  
    ├── schema_backup.sql # Database schema only 
    └── README.md # You're here
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MarioAderman/inventory_system.git
cd inventory_system
```

### 2. Database Setup

```bash
psql -U inventory_admin -d inventory_db -f schema_backup.sql
```
*Adjust `inventory_admin` and `inventory_db` to match your setup.*

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Or `npm start` depending on config
```

---

## 📦 Features

- Product and batch tracking

- Purchase and sales management

- FIFO stock logic

- PostgreSQL-based backend with schema versioning

- CSV export support

- Clean UI with Tailwind CSS

---

## 🛠 Tech Stack

|Layer	   | Tech             |
|----------|------------------|
|Frontend  |React.js, Tailwind|
|Backend   |Node.js, Express  |
|Database  |PostgreSQL        |


