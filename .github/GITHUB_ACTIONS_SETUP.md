# 🚀 Configuración de GitHub Actions - CI/CD

Este documento explica cómo configurar y usar el workflow de GitHub Actions para automatizar las pruebas y despliegues.

## 📋 Descripción General

El workflow `test-and-deploy.yml` automatiza:

1. ✅ **Ejecución de tests de Cypress** en cada push/PR
2. 🚀 **Despliegue a producción** cuando los tests pasan (solo en `main`)
3. 🔍 **Despliegue de preview** para PRs y branch `develop`

## 🔧 Configuración Inicial

### 1. Secrets de GitHub

Debes configurar los siguientes secrets en tu repositorio de GitHub:

**Ruta**: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### Secrets Requeridos:

```yaml
# Supabase
VITE_SUPABASE_URL: "https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY: "tu-anon-key-de-supabase"

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY: "tu-site-key-de-recaptcha"

# Vercel (para despliegue)
VERCEL_TOKEN: "tu-vercel-token"
VERCEL_ORG_ID: "tu-org-id"
VERCEL_PROJECT_ID: "tu-project-id"
```

### 2. Obtener Tokens de Vercel

#### Vercel Token:
1. Ve a [Vercel Settings](https://vercel.com/account/tokens)
2. Click en "Create Token"
3. Dale un nombre descriptivo (ej: "GitHub Actions")
4. Copia el token generado

#### Vercel Org ID y Project ID:
```bash
# Instala Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# En la raíz del proyecto
vercel link

# Los IDs se guardan en .vercel/project.json
cat .vercel/project.json
```

## 📊 Estructura del Workflow

### Jobs Definidos

#### 1. **test** (Pruebas)
- ✅ Ejecuta en: Todos los push y PRs
- 🔨 Acciones:
  - Instala dependencias
  - Construye la aplicación
  - Inicia servidor en puerto 8080
  - Ejecuta tests de Cypress
  - Sube screenshots y videos en caso de error

#### 2. **deploy** (Producción)
- ✅ Ejecuta en: Push a `main` (solo si tests pasan)
- 🔨 Acciones:
  - Construye para producción
  - Despliega a Vercel (producción)
  - Notifica resultado

#### 3. **deploy-preview** (Preview)
- ✅ Ejecuta en: PRs y push a `develop`
- 🔨 Acciones:
  - Construye para preview
  - Despliega ambiente de preview en Vercel
  - Notifica URL de preview

## 🎯 Triggers del Workflow

### Automático:
```yaml
# Push a main o develop
git push origin main
git push origin develop

# Pull Request a main o develop
# (Se ejecuta automáticamente al crear PR)
```

### Manual:
```yaml
# Desde GitHub UI:
Actions → Test and Deploy → Run workflow
```

## 📝 Archivos de Test Ejecutados

```typescript
cypress/e2e/client-login.cy.ts      // 18 tests
cypress/e2e/client-register.cy.ts   // 20 tests
cypress/e2e/auth-flow.cy.ts         // 4 tests
```

**Total**: 42 tests ejecutados en cada run

## 🎨 Badges para README

Puedes agregar estos badges a tu README:

```markdown
![Tests](https://github.com/William19D/evently/workflows/Test%20and%20Deploy/badge.svg)
![Deployment](https://img.shields.io/badge/deploy-vercel-black)
```

## 📊 Artifacts Generados

### En caso de fallos:
- 📸 **Screenshots**: `cypress/screenshots/`
- 🎥 **Videos**: `cypress/videos/`
- ⏱️ **Retención**: 7 días

### Cómo descargar:
1. Ve a la pestaña `Actions` en GitHub
2. Click en el workflow que falló
3. Scroll down a "Artifacts"
4. Descarga `cypress-screenshots` o `cypress-videos`

## 🔍 Monitoreo y Debugging

### Ver logs en tiempo real:
1. Ve a `Actions` en GitHub
2. Click en el workflow en ejecución
3. Click en cualquier job (test, deploy, etc.)
4. Expande los steps para ver logs detallados

### Test Summary:
Cada workflow genera un resumen automático visible en la pestaña "Summary" del workflow run.

## ⚙️ Configuración Avanzada

### Ejecutar tests en paralelo:

```yaml
strategy:
  fail-fast: false
  matrix:
    containers: [1, 2, 3, 4]  # 4 contenedores en paralelo
```

### Agregar más navegadores:

```yaml
- name: 🧪 Run Cypress tests (Firefox)
  uses: cypress-io/github-action@v6
  with:
    browser: firefox
```

### Notificaciones por Slack/Discord:

```yaml
- name: 📢 Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🚦 Flujo Completo de Desarrollo

### 1. Feature Branch
```bash
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. Crear Pull Request
- Los tests se ejecutan automáticamente
- Se despliega preview environment
- Revisión de código

### 3. Merge a Develop
```bash
# Después de aprobación
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
```
- ✅ Tests se ejecutan
- 🔍 Deploy a preview de develop

### 4. Merge a Main (Producción)
```bash
git checkout main
git merge develop
git push origin main
```
- ✅ Tests se ejecutan
- 🚀 Deploy a producción si tests pasan

## 📈 Métricas y Reportes

### GitHub Actions Dashboard:
- Tiempo promedio de ejecución
- Tasa de éxito/fallo
- Uso de minutos de Actions

### Cypress Dashboard (opcional):
```yaml
env:
  CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ⚠️ Troubleshooting

### Tests fallan en CI pero pasan localmente:

**Posibles causas**:
1. Diferencias de timing (agregar más waits)
2. Variables de entorno faltantes
3. Puerto diferente (verificar baseUrl)

**Solución**:
```yaml
# Agregar más tiempo de espera
wait-on-timeout: 120  # 2 minutos
```

### Build falla:

**Verificar**:
1. Todos los secrets estén configurados
2. `npm ci` vs `npm install`
3. Versión de Node.js

### Deploy falla:

**Verificar**:
1. VERCEL_TOKEN válido
2. VERCEL_ORG_ID y PROJECT_ID correctos
3. Permisos en Vercel

## 🔒 Seguridad

### Buenas prácticas:
- ✅ Nunca commitear secrets en el código
- ✅ Usar GitHub Secrets para información sensible
- ✅ Rotar tokens periódicamente
- ✅ Limitar permisos de tokens a lo necesario
- ✅ Revisar logs públicos antes de hacer repo público

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

## 🎯 Checklist de Configuración

- [ ] Crear secrets en GitHub (6 secrets)
- [ ] Verificar que el workflow esté en `.github/workflows/`
- [ ] Hacer push a `develop` para probar
- [ ] Verificar que tests pasen en Actions
- [ ] Verificar que preview deployment funcione
- [ ] Hacer PR a `main` para probar flujo completo
- [ ] Verificar despliegue a producción

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en GitHub Actions
2. Descarga artifacts (screenshots/videos)
3. Verifica secrets configurados correctamente
4. Revisa la documentación de Cypress y Vercel

---

**Última actualización**: Octubre 19, 2025
**Mantenedor**: Equipo Evently
