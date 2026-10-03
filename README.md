# Portfolify (Portolify)

[![Huawei Bootcamp](https://img.shields.io/badge/Huawei-Bootcamp%20Project-red.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-blue.svg)](#)
[![.NET](https://img.shields.io/badge/Backend-.NET%208-purple.svg)](#)

> **Student Learning Project:** This repository is developed as a graduation project/study case for the **Huawei Developer Bootcamp**. It is created purely for educational, training, and self-improvement purposes.

Portfolify is a modern, multi-tenant digital business card and social platform tailored for software developers and technology students. It allows users to showcase their developer profiles, projects, skills, and connect with other developers in a secure and isolated SaaS environment.

---

## <img src="https://api.iconify.design/lucide:layers.svg?color=%23a78bfa" width="20" height="20" align="center" /> Tech Stack & Architecture

The project is split into a clean backend service and a highly interactive frontend application:

### 1. Backend (`/backend`)
Built following **Clean Architecture** and **Domain-Driven Design (DDD)** principles in **.NET 8**:
- **Portfolify.Domain:** Core enterprise business rules, entity models (`Tenant`, `DeveloperProfile`, `Project`, etc.), value objects, and domain exceptions. Completely independent of databases or UI frameworks.
- **Portfolify.Application:** Application business logic, CQRS handlers (utilizing **MediatR**), validation logic (**FluentValidation**), and interfaces.
- **Portfolify.Infrastructure:** External concerns including data access (**Entity Framework Core** with **PostgreSQL**), authentication configuration (JWT Bearer tokens), and other infrastructure clients.
- **Portfolify.WebApi:** REST API controllers, sub-domain tenant resolution middleware, global exception handler middleware, and application bootstrapping.

### 2. Frontend (`/frontend`)
A modern user interface built using the latest web standards:
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS & Vanilla CSS
- **Features:** Clean responsive layout, dynamic forms, tenant-based dashboard, and profile customization.

### 3. Database & DevOps (`/devops`)
- **Database:** PostgreSQL 15 (Alpine)
- **Containerization:** Orchestrated locally via Docker Compose.

---

## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%23818cf8" width="20" height="20" align="center" /> Key Features

- <img src="https://api.iconify.design/lucide:shield-check.svg?color=%2338bdf8" width="16" height="16" align="center" /> **Multi-Tenant (SaaS) Isolation:** Uses a *Shared Database, Shared Schema* model. Tenant separation is enforced dynamically at the database query level using EF Core **Global Query Filters** mapping to tenant identifiers.
- <img src="https://api.iconify.design/lucide:globe.svg?color=%2334d399" width="16" height="16" align="center" /> **Dynamic Tenant Resolution:** Resolves tenants via custom HTTP Headers (`X-Tenant`) or sub-domains (e.g., `john-doe.portfolify.com`) on incoming API requests.
- <img src="https://api.iconify.design/lucide:git-branch.svg?color=%23a78bfa" width="16" height="16" align="center" /> **CQRS Pattern:** MediatR is used to segregate read and write operations, keeping handlers lightweight, testable, and compliant with Single Responsibility Principles (SRP).
- <img src="https://api.iconify.design/lucide:users.svg?color=%23fbbf24" width="16" height="16" align="center" /> **Social Interaction Capabilities:** Features a follower/following system and skill endorsement capabilities that span across tenants.
- <img src="https://api.iconify.design/lucide:check-circle-2.svg?color=%2334d399" width="16" height="16" align="center" /> **Validation Pipeline:** Pre-validates all incoming commands in the MediatR request pipeline using FluentValidation before execution.

---

## <img src="https://api.iconify.design/lucide:play.svg?color=%2334d399" width="20" height="20" align="center" /> Getting Started

Follow these steps to run the application locally on your computer:

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+ recommended) & npm

---

### Step 1: Start the Database
The project uses PostgreSQL database hosted inside a Docker container.
1. Open a terminal and navigate to the `devops` directory:
   ```bash
   cd devops
   ```
2. Start the database service:
   ```bash
   docker compose up -d
   ```
This will spin up a PostgreSQL instance running on port `5432` with a database named `portfolify_db`.

---

### Step 2: Set Up and Run the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Restore NuGet dependencies and build the solution:
   ```bash
   dotnet restore
   dotnet build
   ```
3. Apply database migrations:
   (Ensure you have the `dotnet-ef` tool installed. If not, install it using `dotnet tool install --global dotnet-ef`):
   ```bash
   dotnet ef database update --project src/Portfolify.Infrastructure --startup-project src/Portfolify.WebApi
   ```
4. Run the Web API project:
   ```bash
   dotnet run --project src/Portfolify.WebApi
   ```
The backend API server will start and be available at the specified local ports (e.g., `http://localhost:5000` or `https://localhost:5001`). You can explore the interactive API documentation at `http://localhost:5000/swagger`.

---

### Step 3: Set Up and Run the Frontend
1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (if any) or edit settings, then start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## <img src="https://api.iconify.design/lucide:book-open.svg?color=%2338bdf8" width="20" height="20" align="center" /> Design Decisions & API Reference
For more technical details, design logs, and API routes:
- Check out [Architecture Decisions](docs/architecture_decisions.md)
- Check out [API Endpoints Reference](docs/api_endpoints.md)
- Check out [Migrations Guide](docs/migrations_guide.md)

---

## <img src="https://api.iconify.design/lucide:file-text.svg?color=%2394a3b8" width="20" height="20" align="center" /> License
This project is licensed under the MIT License - see the LICENSE file for details.
