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
        
        # -> Sign in with the visible admin test account using the login form.
        # tu@email.com email field
        elem = page.locator("[data-test=\"login-email\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin@demo.com")
        
        # -> Sign in with the visible admin test account using the login form.
        # password field
        elem = page.locator("[data-test=\"login-password\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Admin123!")
        
        # -> Sign in with the visible admin test account using the login form.
        # Entrar button
        elem = page.locator("[data-test=\"login-submit\"]")
        await elem.click(timeout=10000)
        
        # -> Enter “Ana Torres” in the users search field to filter the list.
        # Buscar por nombre o email… search field
        elem = page.locator("[data-test=\"users-search\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Ana Torres")
        
        # --> Assertions to verify final state
        
        # --> Searching for “Ana Torres” shows the matching user Ana Torres.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The users list URL reflects the “Ana Torres” search.
        await expect(page).to_have_url(re.compile("buscar=Ana\\+Torres"), timeout=15000), "The users list URL reflects the \u201cAna Torres\u201d search."
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The filtered users list shows Ana Torres as a matching result.
        await expect(page.locator("xpath=/html/body/div/div/main/section/div/div[2]/table/tbody/tr/td[1]").nth(0)).to_have_text("Ana Torres", timeout=15000), "The filtered users list shows Ana Torres as a matching result."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    