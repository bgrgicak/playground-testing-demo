import { RunCLIServer } from '@wp-playground/cli';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getAuthHeaders, runPlayground } from '../playground';
import { PHPRequestHandler, PHP } from '@php-wasm/universal';
import { login } from '@wp-playground/blueprints';

describe('API', () => {
  let playground: RunCLIServer;
  let handler: PHPRequestHandler;
  let php: PHP;
  let url: URL;

  beforeAll(async () => {
    playground = await runPlayground();
    handler = playground.requestHandler;
    php = await handler.getPrimaryPhp();
    url = new URL(
      '/wp-json/wceupt/v1/hello',
      handler.absoluteUrl
    );
  });
  afterAll(async () => {
    await playground.server.close();
  });
  beforeEach(async () => {
    await php.run({
      code: `<?php
        require_once '/wordpress/wp-load.php';
        delete_option('wceupt_messages');
      `
    });
  });
  it('Check if the plugin is active', async () => {
    const result = await php.run({
      code: `<?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(is_plugin_active('playground-testing-demo/wceu-playground-tester.php'));
      `
    });
    expect(result.json).toBe(true);
  });

  it('Confirm the API endpoint fails when not authenticated', async () => {
    const response = await handler.request({
      url: url.toString(),
      method: 'POST',
      body: {
        name: 'Hello',
      },
    });
    expect(response.httpStatusCode).toBe(401);
    expect(response.json).toMatchObject({
      "code": "rest_forbidden",
      "data": {
        "status": 401,
      },
      "message": "Sorry, you are not allowed to do that.",
    });
  });
  it('Confirm the API endpoint returns expected response when authenticated', async () => {
    const authHeaders = await getAuthHeaders(handler);
    const response = await handler.request({
      url: url.toString(),
      method: 'POST',
      body: {
        name: 'Hello',
      },
      headers: authHeaders,
    });
    expect(response.httpStatusCode).toBe(200);
    expect(response.json).toMatchObject({
      "message": "User says: Hello",
    });
  });
  it('Confirm the API endpoint fails if the `message` argument isn\'t provided', async () => {
    const authHeaders = await getAuthHeaders(handler);
    const response = await handler.request({
      url: url.toString(),
      method: 'POST',
      headers: authHeaders,
    });
    expect(response.httpStatusCode).toBe(400);
    expect(response.json).toMatchObject({
      "code": "rest_missing_callback_param",
      "data": {
        "params": [
          "name",
        ],
      },
    });
  });
  it('Confirm the API endpoint sanitizes the `message` argument', async () => {
    const authHeaders = await getAuthHeaders(handler);
    const response = await handler.request({
      url: url.toString(),
      method: 'POST',
      headers: authHeaders,
      body: {
        name: '<script>alert("Hello")</script>',
      },
    });
    expect(response.httpStatusCode).toBe(200);
    expect(response.json).toMatchObject({
      "message": "User says: ",
    });
  });
  it('Confirm the API endpoint saves the message to the database', async () => {
    const authHeaders = await getAuthHeaders(handler);
    const response = await handler.request({
      url: url.toString(),
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Hello',
      },
    });
    expect(response.httpStatusCode).toBe(200);

    const result = await php.run({
      code: `<?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(WCEUPT\\get_messages());
      `
    });
    expect(result.json).toMatchObject(['User says: Hello']);
  });
})