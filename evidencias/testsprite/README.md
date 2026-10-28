# Evidencias de TestSprite

Resultados de las ejecuciones del agente de pruebas con IA (TestSprite) sobre la API y la web.

## Estructura

```
evidencias/testsprite/
├── api/    → plan, casos generados y reporte TestSprite de la API (backend, puerto 3000)
├── web/    → plan, casos generados y reporte TestSprite de la web (frontend, puerto 5173)
└── panel.png → captura del panel de TestSprite con ambas ejecuciones
```

Cada carpeta debe contener la salida de la ejecución (`testsprite_tests/`), incluidos:

- Plan de pruebas propuesto y ajustado.
- Casos de prueba generados.
- `TestSprite_MCP_Test_Report.md` y `TestSprite_MCP_Test_Report.html`.

No incluir archivos con la API key ni el archivo `.env`.

## Requisitos para la ejecución

1. Cuenta gratuita en https://testsprite.com y API key generada.
2. Servidor MCP configurado en el IDE con la variable de entorno `API_KEY`
   (nunca escribir la clave en el repositorio).
3. API y web en ejecución:
   - `api/`: `npm run seed` y `npm run dev` (puerto 3000).
   - `web/`: `npm run dev` (puerto 5173).
4. Cargar `PRD.md` en las ejecuciones de tipo backend y frontend.
5. Copiar la carpeta `testsprite_tests/` resultante a `evidencias/testsprite/api`
   y `evidencias/testsprite/web` según corresponda.

## Configuración del MCP en opencode

El servidor está registrado en la configuración global de opencode:

```json
{
  "mcp": {
    "TestSprite": {
      "type": "local",
      "command": ["npx", "-y", "@testsprite/testsprite-mcp@latest"],
      "enabled": true,
      "environment": { "API_KEY": "{env:TESTSRITE_API_KEY}" }
    }
  }
}
```

La clave se lee de la variable de entorno `TESTSRITE_API_KEY` y nunca se escribe en el
repositorio. En Windows se define una sola vez y se reinicia la terminal y opencode:

```powershell
[Environment]::SetEnvironmentVariable("TESTSRITE_API_KEY", "TU_API_KEY", "User")
```

## Estado

Pendiente de ejecución con la API key de TestSprite. Una vez configurada la variable y
reiniciado opencode, se ejecuta el agente para backend (API, puerto 3000) y frontend
(web, puerto 5173), cargando `PRD.md` en ambas ejecuciones.

