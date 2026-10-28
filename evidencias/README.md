# Índice de evidencias

| Evidencia | Archivo | Estado |
| --- | --- | --- |
| Pruebas unitarias y de integración de la API | `coverage/api-tests.txt` | 8 archivos, 61 pruebas aprobadas |
| Pruebas unitarias y de componentes de la web | `coverage/web-tests.txt` | 19 archivos, 76 pruebas aprobadas |
| Cobertura API (resumen JSON) | `coverage/api-coverage-summary.json` | 89.36% líneas, 88.38% sentencias, 96.96% funciones, 81.60% ramas |
| Cobertura web (resumen JSON) | `coverage/web-coverage-summary.json` | 90.86% líneas, 89.87% sentencias, 85.81% funciones, 77.59% ramas |
| Reporte HTML de cobertura API (tabla general) | `coverage/api-coverage-report.png` | Captura |
| Reporte HTML de cobertura API (archivo con líneas sin cubrir) | `coverage/api-app-uncovered.png` | Captura de `app.js` |
| Reporte HTML de cobertura web (tabla general) | `coverage/web-coverage-report.png` | Captura |
| Reporte HTML de cobertura web (archivo con líneas sin cubrir) | `coverage/web-appheader-uncovered.png` | Captura de `AppHeader.vue` |
| Reporte HTML de Playwright (Chromium y Firefox) | `playwright/playwright-report.png` | 21 pruebas aprobadas (20 E2E + setup) |
| Pruebas con TestSprite de la API | `testsprite/api/` | Pendiente de ejecución con API key |
| Pruebas con TestSprite de la web | `testsprite/web/` | Pendiente de ejecución con API key |
| Panel de TestSprite | `testsprite/panel.png` | Pendiente de ejecución con API key |

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
