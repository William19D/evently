# 🚀 Quick Start - GitHub Actions

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Configurar Secrets (Solo una vez)

Ve a: `https://github.com/William19D/evently/settings/secrets/actions`

Agrega estos 3 secrets:

```
VERCEL_TOKEN
ORG_ID
PROJECT_ID
```

> **Nota:** Las variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_RECAPTCHA_SITE_KEY` se configuran en Vercel Dashboard → Environment Variables.

### 2️⃣ ¿Cómo obtener los valores?

#### Vercel:
```bash
# Token:
https://vercel.com/account/tokens

# Org ID y Project ID:
vercel link
cat .vercel/project.json
```

### 3️⃣ Verificar que funciona

```bash
# Push algo a develop
git push origin develop

# Ve a:
https://github.com/William19D/evently/actions

# Deberías ver el workflow ejecutándose
```

## 🎯 Uso Diario

### Crear feature:
```bash
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git push origin feature/nueva-funcionalidad
gh pr create
```
→ Tests se ejecutan automáticamente en el PR

### Deploy a staging:
```bash
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
```
→ Tests + Deploy preview

### Deploy a producción:
```bash
git checkout main
git merge develop
git push origin main
```
→ Tests + Deploy a producción (si pasan)

## 📊 Ver Resultados

**Actions Tab**: https://github.com/William19D/evently/actions

**En un PR**: Los checks aparecen automáticamente

**Artifacts**: Si hay fallos, descarga screenshots/videos

## ⚠️ Si algo falla

1. Ve a Actions tab
2. Click en el workflow que falló
3. Click en el job que falló
4. Lee los logs
5. Descarga artifacts si es necesario

## 🔗 Enlaces Útiles

- **Setup Completo**: `.github/GITHUB_ACTIONS_SETUP.md`
- **Tests Docs**: `TESTS_DOCUMENTACION.md`
- **Actions Tab**: https://github.com/William19D/evently/actions

---

**¿Problemas?** Lee la documentación completa en `.github/GITHUB_ACTIONS_SETUP.md`
