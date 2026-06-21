# Portfolify - API Endpoints Documentation

This document describes the available API endpoints in Portfolify, their query details, request payloads, and the tenant header configurations required to test the application.

---

## Multi-Tenancy Headers

All tenant-specific operations require the `X-Tenant` header. This maps the request to the target developer's portfolio context.
- **v0rteX Profile Identifier**: `X-Tenant: vortex`
- **John Doe Profile Identifier**: `X-Tenant: johndoe`

---

## 1. Tenant Endpoints

### Register Tenant
Creates a new tenant and sets up a dedicated subdomain workspace.

- **URL**: `/api/Tenant`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "Jane Software Agency",
    "identifier": "janesoft"
  }
  ```
- **Response**: `200 OK` (Guid representation of the created Tenant ID)

---

## 2. Developer Profile Endpoints

### Get Active Tenant Profile Details
Fetches the developer profile details (including all projects, social links, and skills with their endorsements) for the resolved tenant.

- **URL**: `/api/DeveloperProfile/details`
- **Method**: `GET`
- **Headers**:
  - `X-Tenant: vortex`
- **Response**: `200 OK`
  ```json
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "fullName": "v0rteX Software Engineer",
    "title": "Senior Backend Architect",
    "bio": "Passionate about .NET 9...",
    "email": "vortex@portfolify.com",
    "projects": [
      {
        "id": "...",
        "title": "Portfolify Backend Engine",
        "description": "...",
        "isFeatured": true
      }
    ],
    "socialLinks": [
      {
        "platformName": "GitHub",
        "url": "https://github.com/vortex"
      }
    ],
    "skills": [
      {
        "id": "55555555-5555-5555-5555-555555555555",
        "name": ".NET 9 / ASP.NET Core",
        "proficiencyLevel": 95,
        "endorsements": [
          {
            "id": "...",
            "endorsedById": "44444444-4444-4444-4444-444444444444",
            "endorsedByName": "John Doe",
            "comment": "Absolutely brilliant at Clean Architecture and C# optimizations!"
          }
        ]
      }
    ]
  }
  ```

### Create Developer Profile
- **URL**: `/api/DeveloperProfile`
- **Method**: `POST`
- **Headers**:
  - `X-Tenant: vortex`
- **Payload**:
  ```json
  {
    "fullName": "Alice Architect",
    "title": "Cloud Engineer",
    "bio": "Specializing in AWS and Kubernetes",
    "email": "alice@portfolify.com"
  }
  ```
- **Response**: `200 OK` (Guid of the created profile)

### Update Developer Profile
- **URL**: `/api/DeveloperProfile/{id}`
- **Method**: `PUT`
- **Headers**:
  - `X-Tenant: vortex`
- **Payload**:
  ```json
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "fullName": "v0rteX Senior Software Architect",
    "title": "Principal Architect / Founder",
    "bio": "Passionate about building complex SaaS systems.",
    "email": "v_architect@portfolify.com"
  }
  ```
- **Response**: `204 NoContent`

---

## 3. Project Endpoints

### Create Project
- **URL**: `/api/Project`
- **Method**: `POST`
- **Headers**:
  - `X-Tenant: vortex`
- **Payload**:
  ```json
  {
    "developerProfileId": "33333333-3333-3333-3333-333333333333",
    "title": "Mobile Portfolio App",
    "description": "A cross-platform Flutter client for Portfolify.",
    "githubUrl": "https://github.com/vortex/portfolify-mobile",
    "projectUrl": "https://vortex.dev/mobile",
    "displayOrder": 3,
    "isFeatured": true
  }
  ```
- **Response**: `200 OK` (Guid of the created project)

### Update Project
- **URL**: `/api/Project/{id}`
- **Method**: `PUT`
- **Headers**:
  - `X-Tenant: vortex`
- **Payload**:
  ```json
  {
    "id": "project-guid-here",
    "title": "Mobile Portfolio App (Updated)",
    "description": "A cross-platform Flutter client featuring offline capability.",
    "displayOrder": 3,
    "isFeatured": true
  }
  ```
- **Response**: `204 NoContent`

### Delete Project
- **URL**: `/api/Project/{id}`
- **Method**: `DELETE`
- **Headers**:
  - `X-Tenant: vortex`
- **Response**: `204 NoContent`

---

## 4. Skill & Endorsement Endpoints

### Create Skill
- **URL**: `/api/Skill`
- **Method**: `POST`
- **Headers**:
  - `X-Tenant: vortex`
- **Payload**:
  ```json
  {
    "developerProfileId": "33333333-3333-3333-3333-333333333333",
    "name": "Docker & Kubernetes",
    "proficiencyLevel": 85,
    "displayOrder": 3
  }
  ```
- **Response**: `200 OK` (Guid of the created skill)

### Delete Skill
- **URL**: `/api/Skill/{id}`
- **Method**: `DELETE`
- **Headers**:
  - `X-Tenant: vortex`
- **Response**: `204 NoContent`

### Endorse Skill
Endorses a developer's skill from another developer's profile context.

- **URL**: `/api/Skill/endorse`
- **Method**: `POST`
- **Headers**:
  - `X-Tenant: vortex` (The tenant of the skill being endorsed)
- **Payload**:
  ```json
  {
    "skillId": "55555555-5555-5555-5555-555555555555",
    "endorsedById": "44444444-4444-4444-4444-444444444444",
    "comment": "Incredible knowledge on dependency lifecycle!"
  }
  ```
- **Response**: `200 OK` (Guid of the created Endorsement ID)

---

## 5. Follow / Social Endpoints

### Follow Developer
- **URL**: `/api/Follow`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "followerId": "44444444-4444-4444-4444-444444444444",
    "followedId": "33333333-3333-3333-3333-333333333333"
  }
  ```
- **Response**: `200 OK` (Guid of the follow relation)

### Unfollow Developer
- **URL**: `/api/Follow/unfollow`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "followerId": "44444444-4444-4444-4444-444444444444",
    "followedId": "33333333-3333-3333-3333-333333333333"
  }
  ```
- **Response**: `204 NoContent`
