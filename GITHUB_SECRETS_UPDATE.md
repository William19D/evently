# 🔐 Actualización de GitHub Secrets - Simplificado

## ✅ Cambio Realizado

Se ha simplificado la configuración de GitHub Actions para usar **solo 3 secrets** en lugar de 6.

## 📊 Antes vs Después

### ❌ Antes (6 secrets)
```yaml
# GitHub Secrets
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RECAPTCHA_SITE_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### ✅ Ahora (3 secrets)
```yaml
# GitHub Secrets (solo Vercel)
VERCEL_TOKEN
ORG_ID
PROJECT_ID

# Variables de Entorno en Vercel
VITE_SUPABASE_URL          → Configurar en Vercel
VITE_SUPABASE_ANON_KEY     → Configurar en Vercel
VITE_RECAPTCHA_SITE_KEY    → Configurar en Vercel
```

## 🎯 Por qué este cambio?

1. **Separación de responsabilidades**: Las variables de entorno de la aplicación (Supabase, reCAPTCHA) deben estar en Vercel, donde se ejecuta la app en producción.

2. **Mejor seguridad**: Vercel maneja automáticamente estas variables en todos los deploys (producción y preview).

3. **Menos duplicación**: No necesitas mantener los mismos valores en dos lugares.

4. **Simplicidad**: Solo necesitas 3 secrets en GitHub para el deployment.

## 🔧 Configuración Requerida

### En GitHub (3 secrets)

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret Name | Descripción | Cómo Obtenerlo |
|------------|-------------|----------------|
| `VERCEL_TOKEN` | Token de autenticación | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `ORG_ID` | Organization/Team ID | Ejecuta `vercel link` → `.vercel/project.json` |
| `PROJECT_ID` | Project ID | Ejecuta `vercel link` → `.vercel/project.json` |

### En Vercel Dashboard

`Project Settings` → `Environment Variables`

| Variable | Scope | Valor |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Production, Preview, Development | Tu URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Tu Anon Key |
| `VITE_RECAPTCHA_SITE_KEY` | Production, Preview, Development | Tu reCAPTCHA Key |

## 📝 Archivos Actualizados

- ✅ `.github/workflows/test-and-deploy.yml` - Workflow simplificado
- ✅ `.github/GITHUB_ACTIONS_SETUP.md` - Documentación actualizada
- ✅ `.github/README.md` - Quick start actualizado
- ✅ `GITHUB_ACTIONS_QUICKSTART.md` - Guía rápida actualizada
- ✅ `GITHUB_ACTIONS_SUMMARY.md` - Resumen actualizado

## 🚀 Próximos Pasos

1. **Configura los 3 secrets en GitHub**:
   ```bash
   # Obtén los IDs de Vercel
   vercel link
   cat .vercel/project.json
   ```

2. **Configura las variables de entorno en Vercel**:
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega las 3 variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_RECAPTCHA_SITE_KEY)
   - Aplica a: Production, Preview, Development

3. **Prueba el workflow**:
   ```bash
   git add .
   git commit -m "chore: simplify GitHub Actions secrets configuration"
   git push origin main
   ```

4. **Verifica**:
   - Ve a `Actions` tab en GitHub
   - Verifica que el workflow se ejecute correctamente
   - Los tests deben pasar
   - El deploy debe funcionar

## ⚠️ Importante

- **NO borres** las variables de entorno de Vercel, son necesarias para que la app funcione.
- **Los tests de Cypress** no necesitan estas variables porque usan `cy.bypassRecaptcha()` y mocks de Supabase.
- **El build de Vercel** sí necesita estas variables, asegúrate de configurarlas en Vercel Dashboard.

## 🔗 Referencias

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

**Última actualización**: Octubre 19, 2025
**Estado**: ✅ Configuración simplificada y documentada
