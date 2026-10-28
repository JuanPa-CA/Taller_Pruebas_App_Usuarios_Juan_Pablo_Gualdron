# Índice de evidencias

| Evidencia | Archivo | Estado |
| --- | --- | --- |
| Pruebas unitarias y de integración de la API | `coverage/api/api-tests.txt` / `api-tests.png` | 8 archivos, 61 pruebas aprobadas |
| Pruebas unitarias y de componentes de la web | `coverage/web/web-tests.txt` / `web-tests.png` | 19 archivos, 76 pruebas aprobadas |
| Resumen de cobertura en terminal (API) | `coverage/api/api-coverage-terminal.png` | Captura |
| Resumen de cobertura en terminal (web) | `coverage/web/web-coverage-terminal.png` | Captura |
| Cobertura API (resumen JSON) | `coverage/api/api-coverage-summary.json` | 89.36% líneas, 88.38% sentencias, 96.96% funciones, 81.60% ramas |
| Cobertura web (resumen JSON) | `coverage/web/web-coverage-summary.json` | 90.86% líneas, 89.87% sentencias, 85.81% funciones, 77.59% ramas |
| Reporte HTML de cobertura API (tabla general) | `coverage/api/api-coverage-report.png` | Captura |
| Reporte HTML de cobertura API (archivo con líneas sin cubrir) | `coverage/api/api-app-uncovered.png` | Captura de `app.js` |
| Reporte HTML de cobertura web (tabla general) | `coverage/web/web-coverage-report.png` | Captura |
| Reporte HTML de cobertura web (archivo con líneas sin cubrir) | `coverage/web/web-appheader-uncovered.png` | Captura de `AppHeader.vue` |
| Reporte HTML de Playwright (Chromium y Firefox) | `playwright/playwright-report.png` | 21 pruebas aprobadas (20 E2E + setup) |
| Pruebas con TestSprite de la API | `testsprite/api/` | 10 pruebas aprobadas (10/10) |
| Pruebas con TestSprite de la web | `testsprite/web/` | 15 pruebas aprobadas (15/15) |
| Panel de TestSprite | `testsprite/panel.png` | Captura del panel |

## Comandos reproducibles

```powershell
# API
cd api
npm install
npm test
npm run coverage

# Web
cd web
npm install
npm test
npm run coverage
npm run test:e2e
```
