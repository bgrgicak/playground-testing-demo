import {
  test,
  expect,
  describe,
  beforeEach,
  afterAll,
  beforeAll,
} from "vitest";
import {
  type PHPRequestHandler,
  type PHP,
} from "@php-wasm/universal";
import { RunCLIServer } from "@wp-playground/cli";
import { getAuthHeaders, requestFollowRedirects, runPlayground } from "../playground";

describe("Workshop Tests", () => {
  let cliServer: RunCLIServer;
  let handler: PHPRequestHandler;
  let php: PHP;
  beforeAll(async () => {
    cliServer = await runPlayground();
    handler = cliServer.requestHandler;
    php = await handler.getPrimaryPhp();
  });
  beforeEach(async () => {
    await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        delete_option('PTD_messages');
      `,
    });
  });
  afterAll(async () => {
    if (cliServer) {
      await cliServer.server.close();
    }
  });
  test("Should activate plugin", async () => {
    const activePlugins = await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(get_option('active_plugins'));
      `,
    });
    expect(activePlugins.json).toContain(
      "playground-testing-demo/playground-testing-demo.php"
    );
  });

  test("Should fail to get API endpoint response for non-logged in user", async () => {
    const response = await requestFollowRedirects(
      handler,
      {
        url: "/wp-json/PTD/v1/message",
        method: "POST",
        body: { message: "John Doe" },
      }
    );
    expect(response.httpStatusCode).toBe(401);
  });
  test("Should get API endpoint response for logged in user", async () => {
    const authHeaders = await getAuthHeaders(handler);
    const apiResponse = await requestFollowRedirects(
      handler,
      {
        url: "/wp-json/PTD/v1/message",
        method: "POST",
        headers: authHeaders,
        body: { message: "John Doe" },
      }
    );
    expect(apiResponse.httpStatusCode).toBe(200);
    expect(apiResponse.json.success).toBe(true);
    expect(apiResponse.json.message).toContain("User says: John Doe");
  });

  test("Should fail to get API endpoint response if name is not provided", async () => {
    const authHeaders = await getAuthHeaders(handler);
    const apiResponse = await requestFollowRedirects(
      handler,
      {
        url: "/wp-json/PTD/v1/message",
        method: "POST",
        headers: authHeaders,
      }
    );
    expect(apiResponse.httpStatusCode).toBe(400);
  });

  test("Should sanitize API request input", async () => {
    const authHeaders = await getAuthHeaders(handler);
    const apiResponse = await requestFollowRedirects(
      handler,
      {
        url: "/wp-json/PTD/v1/message",
        method: "POST",
        headers: authHeaders,
        body: { message: '<script>alert("XSS")</script>' },
      }
    );

    expect(apiResponse.httpStatusCode).toBe(200);
    expect(apiResponse.json.success).toBe(true);
    expect(apiResponse.json.message).toBe("User says: ");
  });

  test("Should save message after API request", async () => {
    const authHeaders = await getAuthHeaders(handler);
    await requestFollowRedirects(handler, {
      url: "/wp-json/PTD/v1/message",
      method: "POST",
      headers: authHeaders,
      body: { message: "John Doe" },
    });

    const result = await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(array(
          'message' => PTD\\get_messages()
        ));
      `,
    });
    expect(result.json.message.length).toBe(1);
    expect(result.json.message[0]).toBe("User says: John Doe");
  });
});
