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
        
        # -> Sign in with the displayed admin test credentials using the login form.
        # tu@email.com email field
        elem = page.locator("[data-test=\"login-email\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin@demo.com")
        
        # -> Sign in with the displayed admin test credentials using the login form.
        # password field
        elem = page.locator("[data-test=\"login-password\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Admin123!")
        
        # -> Sign in with the displayed admin test credentials using the login form.
        # Entrar button
        elem = page.locator("[data-test=\"login-submit\"]")
        await elem.click(timeout=10000)
        
        # -> Click “Cerrar sesión” and verify that the login page is displayed.
        # Cerrar sesión button
        elem = page.locator("[data-test=\"logout\"]")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Logging out returns the user to the login page with the sign-in form visible.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The user is returned to the login page.
        await expect(page).to_have_url(re.compile("/login"), timeout=15000), "The user is returned to the login page."
        await page.locator("[data-test=\"login-email\"]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The email field is visible on the sign-in form.
        await expect(page.locator("[data-test=\"login-email\"]").nth(0)).to_be_visible(timeout=15000), "The email field is visible on the sign-in form."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    