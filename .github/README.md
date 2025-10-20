# 🤖 GitHub Workflows

Este directorio contiene la configuración de automatización para CI/CD del proyecto Evently.

## 📁 Contenido

### Workflows

- **`test-and-deploy.yml`** - Workflow principal de CI/CD
  - Ejecuta tests de Cypress automáticamente
  - Despliega a producción cuando los tests pasan
  - Crea deploys de preview para PRs

## 🚀 Quick Start

### 1. Configurar Secrets

Ve a `Settings` → `Secrets and variables` → `Actions` y agrega:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RECAPTCHA_SITE_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### 2. Trigger Manual

```bash
# En GitHub:
Actions → Test and Deploy → Run workflow
```

### 3. Trigger Automático

```bash
# Push a main
git push origin main

# Crear PR
gh pr create --base main
```

## 📊 Proceso de CI/CD

```mermaid
graph LR
    A[Push/PR] --> B[Install Dependencies]
    B --> C[Build App]
    C --> D[Start Server]
    D --> E[Run Cypress Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Deploy]
    F -->|No| H[Upload Artifacts]
    G --> I[Production/Preview]
```

## 📚 Documentación

Para más detalles, ver [`GITHUB_ACTIONS_SETUP.md`](./GITHUB_ACTIONS_SETUP.md)

## 🔗 Enlaces Útiles

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Vercel Deploy Action](https://github.com/amondnet/vercel-action)

---

**Mantenido por**: Equipo Evently
