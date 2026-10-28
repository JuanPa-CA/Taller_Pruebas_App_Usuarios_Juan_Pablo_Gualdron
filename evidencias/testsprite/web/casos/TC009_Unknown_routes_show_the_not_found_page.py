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
        
        # -> Open a clearly non-existent application route and check whether the application displays its not-found screen.
        await page.goto("http://localhost:5173/this-route-does-not-exist")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> The invalid route displays the application’s not-found screen.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The browser remains on the invalid route.
        await expect(page).to_have_url(re.compile("/this\\-route\\-does\\-not\\-exist"), timeout=15000), "The browser remains on the invalid route."
        await page.locator("[data-test=\"go-home\"]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The not-found screen’s “Ir al inicio” link is visible.
        await expect(page.locator("[data-test=\"go-home\"]").nth(0)).to_be_visible(timeout=15000), "The not-found screen\u2019s \u201cIr al inicio\u201d link is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    