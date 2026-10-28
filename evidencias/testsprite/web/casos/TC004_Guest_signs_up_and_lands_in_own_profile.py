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
        
        # -> Open the registration form using the “Crea una” link.
        # Crea una link
        elem = page.locator("[data-test=\"go-register\"]")
        await elem.click(timeout=10000)
        
        # -> Enter a new guest’s details and submit the “Crear cuenta” form.
        # text field
        elem = page.locator("[data-test=\"register-name\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("QA Guest")
        
        # -> Enter a new guest’s details and submit the “Crear cuenta” form.
        # tu@email.com email field
        elem = page.locator("[data-test=\"register-email\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("qa.guest.20261026@example.com")
        
        # -> Enter a new guest’s details and submit the “Crear cuenta” form.
        # password field
        elem = page.locator("[data-test=\"register-password\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("GuestPass123")
        
        # -> Enter a new guest’s details and submit the “Crear cuenta” form.
        # password field
        elem = page.locator("[data-test=\"register-confirmation\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("GuestPass123")
        
        # -> Enter a new guest’s details and submit the “Crear cuenta” form.
        # Crear cuenta button
        elem = page.locator("[data-test=\"register-submit\"]")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The new account is on the profile page.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The profile page URL is displayed.
        await expect(page).to_have_url(re.compile("/perfil"), timeout=15000), "The profile page URL is displayed."
        
        # --> The profile shows the account role as “Usuario.”
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The profile shows the user role as “Usuario.”
        await expect(page.locator("#main-nav").nth(0)).to_contain_text("Usuario", timeout=15000), "The profile shows the user role as \u201cUsuario.\u201d"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    