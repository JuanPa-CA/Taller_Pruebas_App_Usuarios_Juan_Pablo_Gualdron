import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Enter the displayed admin email and password, then submit the sign-in form.
        # tu@email.com email field
        elem = page.locator("[data-test=\"login-email\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin@demo.com")
        
        # -> Enter the displayed admin email and password, then submit the sign-in form.
        # password field
        elem = page.locator("[data-test=\"login-password\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Admin123!")
        
        # -> Enter the displayed admin email and password, then submit the sign-in form.
        # Entrar button
        elem = page.locator("[data-test=\"login-submit\"]")
        await elem.click(timeout=10000)
        
        # -> Search the user list for “Ana Torres” and verify that the filtered table shows the matching user.
        # Buscar por nombre o email… search field
        elem = page.locator("[data-test=\"users-search\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Ana Torres")
        
        # --> Assertions to verify final state
        
        # --> The filtered user list shows the searched-for user Ana Torres.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The filtered user list should include Ana Torres.
        await expect(page.locator("[data-test=\"user-row\"]").nth(0)).to_contain_text("Ana Torres", timeout=15000), "The filtered user list should include Ana Torres."
        
        # --> The filtered user table is displayed.
        await page.get_by_role("row", name="Nombre Email Rol Alta Acciones").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The filtered user table should be visible.
        await expect(page.get_by_role("row", name="Nombre Email Rol Alta Acciones").nth(0)).to_be_visible(timeout=15000), "The filtered user table should be visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    