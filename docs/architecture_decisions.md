# Portfolify - Architecture Decision Record & Project Scope

This document details the architectural decisions, design principles, multi-tenancy model, and project scope for **Portfolify**—a personal digital business card and social platform for developers and technology students.

---

## 1. Clean Architecture Overview

The backend is built using **Clean Architecture** patterns. This isolates core business rules from external concerns like databases, frameworks, or user interfaces.

```
                  ┌──────────────────────┐
                  │      Web API         │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼──────────┐
                  │    Infrastructure   │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼──────────┐
                  │     Application     │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼──────────┐
                  │       Domain        │
                  └─────────────────────┘
```

### Layer Breakdown:
- **Portfolify.Domain**: Core domain concepts. Contains entity definitions, value objects, exceptions, and core domain interfaces. It has zero external dependencies (no databases, no third-party libraries except basic annotations).
- **Portfolify.Application**: Orchestrates use cases. Contains CQRS commands and queries, handlers, validators, behaviors, DTOs, and interface definitions (e.g., `IApplicationDbContext`). It only references the Domain layer.
- **Portfolify.Infrastructure**: Implements external concerns. Contains EF Core `ApplicationDbContext` mapped to PostgreSQL, configurations, JWT bearer token configurations, and email/storage clients. It references the Application layer.
- **Portfolify.WebApi**: The entry point. Bootstraps the application, exposes HTTP API controllers, maps routing, resolves dependency injections, and hosts middlewares (e.g., Exception Handling, Tenant Resolution). It references the Infrastructure and Application layers.

---

## 2. SOLID Principles Compliance

- **Single Responsibility Principle (SRP)**: Each handler in the CQRS pattern handles exactly *one* Command or Query. Controllers only route HTTP requests, and the DbContext only deals with data persistence.
- **Open/Closed Principle (OCP)**: Adding new behavior to requests is done using MediatR **Pipeline Behaviors** (like `LoggingBehavior` or `ValidationBehavior`) without modifying existing handlers or commands.
- **Liskov Substitution Principle (LSP)**: Interfaces like `IApplicationDbContext` and `ICurrentUserService` allow substituting mocked implementations during unit testing without breaking core Application layer flows.
- **Interface Segregation Principle (ISP)**: Application layer interfaces are highly cohesive and focused (e.g., `ICurrentUserService` only exposes user metadata).
- **Dependency Inversion Principle (DIP)**: High-level application logic does not depend on low-level modules like EF Core or HTTP context. Instead, both depend on abstractions (e.g., `IApplicationDbContext` defined in Application, implemented in Infrastructure).

---

## 3. CQRS Pattern (using MediatR)

The application uses **CQRS (Command Query Responsibility Segregation)** to separate read operations from write operations:

- **Commands** (Write Operations): Implement `IRequest<TResponse>` and modify system state. Handled by separate classes extending `IRequestHandler<TCommand, TResponse>`.
- **Queries** (Read Operations): Implement `IRequest<TResponse>` and retrieve data with `AsNoTracking()` optimization.
- **Validation**: Incoming Commands are automatically validated before execution by FluentValidation within a MediatR pipeline behavior, ensuring only valid data reaches handlers.

---

## 4. Multi-Tenant SaaS Architecture

Portfolify is designed as a **Multi-Tenant (SaaS)** system using a **Shared Database, Shared Schema** model:

- **Tenant Isolation**: Managed via an EF Core **Global Query Filter** applied to all entities implementing the `IMustHaveTenant` interface:
  ```csharp
  modelBuilder.Entity<DeveloperProfile>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
  ```
  This automatically appends `WHERE TenantId = @TenantId` to all generated queries, preventing data leakage between developer portfolios.
- **Tenant Resolution**: Handled dynamically during request initialization using `TenantResolutionMiddleware`. The tenant is resolved by looking up a custom header (`X-Tenant`) or the subdomain (e.g. `john-doe.portfolify.com`). If valid, the corresponding tenant ID is stored in the current request context (`HttpContext.Items`).
- **Data Protection**: `ApplicationDbContext` intercepts saving operations and automatically sets the correct `TenantId` for any new tenant-scoped entity based on the current context, preventing manual assignment errors.

---

## 5. Database Choice & Schema Model

The persistence layer uses **PostgreSQL** configured via Entity Framework Core:

### Entities Schema Summary:
1. **Tenant**: System-level container.
   - `Id` (Guid), `Name` (string), `Identifier` (string - subdomain/slug), `IsActive` (bool).
2. **DeveloperProfile**: Core portfolio profile.
   - `FullName`, `Title`, `Bio`, `AvatarUrl`, `ResumeUrl`, `BlogUrl`, `Email` (Tenant-scoped).
3. **Project**: Portfolio projects.
   - `Title`, `Description`, `ProjectUrl`, `GithubUrl`, `ImageUrl`, `DisplayOrder`, `IsFeatured` (Tenant-scoped).
4. **SocialLink**: Portfolio social accounts.
   - `PlatformName`, `Url`, `IconName` (Tenant-scoped).
5. **Skill**: Portfolio developer skills.
   - `Name`, `ProficiencyLevel`, `DisplayOrder` (Tenant-scoped).
6. **SkillEndorsement** (Social Feature): Endorsements of skills by other developers.
   - `SkillId`, `EndorsedById` (Foreign key to `DeveloperProfile` of endorser), `Comment`.
7. **Follower** (Social Feature): Developer-to-developer following.
   - `FollowerId` (Follower profile), `FollowedId` (Followed profile).

---

## 6. Social Networking Roadmap (LinkedIn/GitHub Style)

To accommodate the social networking features where developers follow each other and endorse skills:
- **Cross-Tenant Relations**: Models like `Follower` and `SkillEndorsement` link developer profiles together. Because relationships span across tenants (a developer from Tenant A endorsing/following a developer from Tenant B), global filters are carefully omitted or structured for these junction tables.
- **Security Check**: To endorse a skill, the user must be authenticated. The `EndorsedById` is set dynamically based on the current authenticated user's profile ID.
