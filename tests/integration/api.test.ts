import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runCLI } from "@wp-playground/cli";
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { login } from '@wp-playground/blueprints';
import { PHP, PHPRequestHandler } from '@php-wasm/universal';
import { URL } from 'url';
import makeFetchCookie from "fetch-cookie";

const fetchCookie = makeFetchCookie(fetch);

const getAuthHeaders = async (handler: PHPRequestHandler, php: PHP) => {
  await php.writeFile(
    "/wordpress/get-nonce.php",
    `<?php
    require_once '/wordpress/wp-load.php';
    echo json_encode(
      array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
      )
    );
    `
  );

  await login(php, {
    username: "admin",
  });
  const response = await fetchCookie(handler.absoluteUrl + "/get-nonce.php");
  return await response.json();
};

describe("API", () => {
  let server;
  let handler: PHPRequestHandler;
  let php: PHP;
  let apiUrl: URL;

  beforeAll(async () => {
    const blueprint = JSON.parse(
      readFileSync(resolve("./blueprint.json"), "utf8")
    );
    const cli = await runCLI({
      command: "server",
      mount: [
        {
          hostPath: ".",
          vfsPath: "/wordpress/wp-content/plugins/playground-testing-demo",
        },
      ],
      blueprint,
    });
    server = cli.server;
    handler = cli.requestHandler;
    php = await handler.getPrimaryPhp();
    apiUrl = new URL("/wp-json/PTD/v1/message", handler.absoluteUrl);
  });
  afterAll(async () => {
    await server.close();
  });
  it("Check if plugin is active", async () => {
    const result = await php.run({
      code: `<?php
      require_once '/wordpress/wp-load.php';
      echo json_encode(
        is_plugin_active('playground-testing-demo/playground-testing-demo.php')
      );
      `,
    });
    expect(result.json).toBe(true);
  });
  it("API should fail", async () => {
    const formData = new FormData();
    formData.append("message", "hi");
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      body: formData,
    });
    console.log(await response.json());
    expect(response.status).toBe(401);
  });
  it("API should pass", async () => {
    const headers = await getAuthHeaders(handler, php);
    const formData = new FormData();
    formData.append("message", "hi");
    const response = await fetchCookie(apiUrl.toString(), {
      method: "POST",
      body: formData,
      headers,
    });
    console.log(await response.json());
    expect(response.status).toBe(200);
  });
});