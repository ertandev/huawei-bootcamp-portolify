# Portfolify - Entity Framework Core Migrations Guide

This document describes how to manage and apply database migrations in **Portfolify** using Entity Framework Core tools.

---

## 1. Prerequisites

To run EF Core migration commands, you must install the .NET Entity Framework Core Tools CLI globally.

### Install EF Core CLI Tools
Open a terminal and install `dotnet-ef` globally:
```powershell
dotnet tool install --global dotnet-ef --version 9.0.0
```
> [!NOTE]
> Since Portfolify is built on **.NET 9**, we install **version 9.0.0** of the tool to ensure perfect version alignment.

If the command fails due to path issues in your current shell session, you can run it using its absolute path:
```powershell
& "$env:USERPROFILE\.dotnet\tools\dotnet-ef.exe" --version
```

---

## 2. Creating a New Migration

Whenever you add or modify entities in `Portfolify.Domain` or change model maps in `ApplicationDbContext.cs`, you must generate a new migration file.

### Command Structure
Run this command from the `/backend` root directory:
```powershell
# Set roll-forward to prevent version mismatch warnings if using newer SDKs
$env:DOTNET_ROLL_FORWARD="Major"

# Add the migration
dotnet ef migrations add <MigrationName> `
  --project src/Portfolify.Infrastructure `
  --startup-project src/Portfolify.WebApi `
  --output-dir Persistence/Migrations
```

### Example:
To create a migration named `AddBioFields`:
```powershell
dotnet ef migrations add AddBioFields --project src/Portfolify.Infrastructure --startup-project src/Portfolify.WebApi --output-dir Persistence/Migrations
```

This generates three files under `Portfolify.Infrastructure/Persistence/Migrations/`:
- `xxxxxx_AddBioFields.cs`: The core migration file containing the `Up` and `Down` DB modifications.
- `xxxxxx_AddBioFields.Designer.cs`: Metadata details about the EF Core model.
- `ApplicationDbContextModelSnapshot.cs`: Current snapshot of the model metadata.

---

## 3. Applying Migrations to the Database

There are two primary methods to apply migrations:

### Method A: Automated Startup Application (Recommended for Development)
The application's `Program.cs` is configured to run database provisioning automatically on startup:
```csharp
var context = (ApplicationDbContext)services.GetRequiredService<IApplicationDbContext>();
await ApplicationDbContextSeed.SeedSampleDataAsync(context);
```
During `SeedSampleDataAsync`, `context.Database.EnsureCreatedAsync()` is executed. This automatically maps the DbContext models, creates the tables in PostgreSQL (if they do not exist), and inserts the default seed data.

> [!WARNING]
> `EnsureCreated()` bypasses migration tables. For staging or production environments, replace `context.Database.EnsureCreatedAsync()` with `context.Database.MigrateAsync()` to enforce sequential migration tracking.

### Method B: Manual CLI Application
If you prefer to push migrations manually to the PostgreSQL database, run this command from the `/backend` folder:
```powershell
$env:DOTNET_ROLL_FORWARD="Major"

dotnet ef database update `
  --project src/Portfolify.Infrastructure `
  --startup-project src/Portfolify.WebApi
```

---

## 4. Troubleshooting Common Errors

### Error: "Startup project doesn't reference Microsoft.EntityFrameworkCore.Design"
**Solution**: The startup project (WebApi) must contain reference to `Microsoft.EntityFrameworkCore.Design` to execute EF Core operations. We have pre-configured this inside [Portfolify.WebApi.csproj](file:///c:/Users/v0rteX/Desktop/Portolify/backend/src/Portfolify.WebApi/Portfolify.WebApi.csproj):
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.0">
  <PrivateAssets>all</PrivateAssets>
  <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
</PackageReference>
```

### Error: "Framework Microsoft.AspNetCore.App, version 9.0.0 not found"
This happens if you have the .NET 10 SDK but lack the .NET 9 AspNetCore runtime pack on your host system.
**Solution**: Set the roll forward environment variable before running `dotnet ef`:
```powershell
$env:DOTNET_ROLL_FORWARD="Major"
```
This forces the CLI tool to roll forward and utilize your installed .NET 10.0 runtime.
