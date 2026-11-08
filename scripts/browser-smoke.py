"""Optional Chromium integration check. Requires Python playwright and Chromium.
Start `npm run web -- --port 8081` first. Uses an isolated browser profile.
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox', '--enable-features=SharedArrayBuffer'])
        context = await browser.new_context(viewport={'width': 412, 'height': 915})
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto('http://localhost:8081', wait_until='domcontentloaded', timeout=180000)
        await page.get_by_text('Ready for the road?', exact=True).wait_for(timeout=120000)
        screenshots = Path('docs/screenshots')
        screenshots.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(screenshots / 'dashboard.png'))
        # Already-loaded app runs without network, including real browser SQLite writes.
        await context.set_offline(True)
        await page.get_by_text('Vehicles', exact=True).click()
        await page.get_by_role('button', name='Add', exact=True).click()
        await page.get_by_label('Nickname (optional)', exact=True).fill('Offline test')
        for label,value in [('Registration number','OFF-2026'),('Make','Toyota'),('Model','Aqua'),('Manufacture year','2017'),('Current mileage (km)','50000')]:
            await page.get_by_label(label, exact=True).fill(value)
        await page.get_by_role('button',name='Save vehicle',exact=True).click()
        await page.get_by_text('OFF-2026',exact=True).filter(visible=True).first.wait_for()
        await page.get_by_role('textbox',name='Search',exact=True).fill('OFF-2026')
        await page.get_by_role('button',name='View vehicle',exact=True).click()
        await page.get_by_role('button',name='Add service',exact=True).click()
        for label,value in [('Mileage at service (km)','50100'),('Service cost (LKR)','12345'),('Workshop (optional)','Offline Workshop')]:
            await page.get_by_label(label,exact=True).fill(value)
        await page.get_by_role('button',name='Save record',exact=True).click()
        await page.get_by_text('LKR 12,345.00',exact=True).filter(visible=True).first.wait_for()
        await page.get_by_role('button',name='Add fuel',exact=True).click()
        for label,value in [('Odometer (km)','50200'),('Litres purchased','20'),('Total cost (LKR)','6200')]:
            await page.get_by_label(label,exact=True).fill(value)
        await page.get_by_role('button',name='Save record',exact=True).click()
        await page.get_by_text('LKR 18,545.00',exact=True).filter(visible=True).first.wait_for()
        # Return to tabs using the stack header.
        await page.go_back()
        await page.get_by_text('Reports',exact=True).click()
        await page.get_by_text('The bigger picture',exact=True).wait_for()
        await page.screenshot(path=str(screenshots / 'reports.png'))
        await page.get_by_text('Services',exact=True).click()
        await page.get_by_role('textbox',name='Search',exact=True).fill('Offline Workshop')
        await page.get_by_text('Offline Workshop',exact=False).filter(visible=True).first.wait_for()
        await page.get_by_text('Fuel',exact=True).last.click()
        await page.get_by_text('Fuel tracker',exact=True).wait_for()
        # Reconnect only to reload development assets, then verify persisted SQLite data.
        await context.set_offline(False)
        await page.reload(wait_until='domcontentloaded')
        await page.get_by_text('Fuel tracker',exact=True).wait_for(timeout=60000)
        await page.get_by_text('Vehicles',exact=True).click()
        await page.get_by_role('textbox',name='Search',exact=True).fill('OFF-2026')
        await page.get_by_text('OFF-2026',exact=True).filter(visible=True).first.wait_for()
        page.once('dialog',lambda dialog: dialog.accept())
        await page.get_by_role('button',name='Delete vehicle',exact=True).click()
        await page.get_by_text('No matching vehicles',exact=True).wait_for()
        assert not errors, errors
        print('PASS: Chromium navigation, offline vehicle/service/fuel creation, search, reports, restart persistence and vehicle deletion; no page errors.')
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
