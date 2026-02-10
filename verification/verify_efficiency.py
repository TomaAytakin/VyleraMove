from playwright.sync_api import sync_playwright

def run():
    print("Starting verification script...")
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        url = "http://localhost:3000/dashboard/efficiency"
        print(f"Navigating to {url}...")

        try:
            page.goto(url)
            page.wait_for_timeout(3000) # Wait for redirects/load

            # Check if redirected to login
            if "sign in" in page.title().lower() or "login" in page.url.lower():
                print("Redirected to login. Attempting to sign in...")
                # Try standard NextAuth fields
                try:
                    page.fill("input[name='email']", "admin@vyleramove.com")
                    page.fill("input[name='password']", "password123")
                    # Look for button
                    page.click("button[type='submit']")
                    print("Submitted login form.")
                    page.wait_for_timeout(5000) # Wait for login
                except Exception as e:
                    print(f"Login attempt failed: {e}")
                    # Maybe custom login page?

            print("Taking screenshot...")
            page.screenshot(path="verification/efficiency_dashboard.png", full_page=True)
            print("Screenshot saved to verification/efficiency_dashboard.png")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
