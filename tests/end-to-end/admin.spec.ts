import { test, expect } from "@playwright/test";
import { PHPRequestHandler, PHP } from "@php-wasm/universal";
import { runPlayground } from "../playground";

test.describe("Workshop Tests", () => {
  let cliServer: any;
  let handler: PHPRequestHandler;
  let php: PHP;

  test.beforeEach(async () => {
    cliServer = await runPlayground();
    handler = cliServer.requestHandler;
    php = await handler.getPrimaryPhp();
  });

  test.afterEach(async () => {
    if (cliServer) {
      await cliServer.server.close();
    }
  });

  test("Admin page form", async ({ page }) => {
    const wpAdminUrl = new URL(handler.absoluteUrl);
    wpAdminUrl.pathname = "/wp-admin/admin.php";
    wpAdminUrl.searchParams.set("page", "workshop-tests");
    await page.goto(wpAdminUrl.toString());

    await expect(page).toHaveTitle(/Workshop Tests/);

    await page.getByPlaceholder("Enter a message").fill("Hello, world!");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("User says: Hello, world!")).toBeVisible();

    await page.reload();
    await expect(page.getByText("User says: Hello, world!")).toBeVisible();
  });
});
