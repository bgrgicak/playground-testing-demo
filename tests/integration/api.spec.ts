import { test, expect, describe, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import { defineWpConfigConsts } from "@wp-playground/blueprints";
import { type PHPRequest, type PHPRequestHandler, type PHP } from '@php-wasm/universal';
import { runCLI, RunCLIServer } from '@wp-playground/cli';


const requestFollowRedirects = async (handler: PHPRequestHandler, request: PHPRequest) => {
  let response = await handler.request(request);
  while (response.httpStatusCode === 302) {
    response = await handler.request({
      url: response.headers['location'][0],
    });
  }
  return response;
};

const login = async (handler: PHPRequestHandler, username: string = 'admin') => {
  await defineWpConfigConsts(await handler.getPrimaryPhp(), {
    consts: {
      PLAYGROUND_FORCE_AUTO_LOGIN_ENABLED: true,
    },
  });


  const response = await requestFollowRedirects(
    handler,
    {
      url: '/wp-admin/?playground_force_auto_login_as_user=admin',
    }
  );
  return response.httpStatusCode === 200;
};

const getRestAuthHeaders = async (handler: PHPRequestHandler, php: PHP) => {
  if (!php.fileExists('/wordpress/get_rest_auth_data.php')) {
    await php.writeFile(
      '/wordpress/get_rest_auth_data.php',
      `<?php
      require_once '/wordpress/wp-load.php';
      $cookieArray = [];
      foreach ($_COOKIE as $key => $value) {
          $cookieArray[] = $key . '=' . urlencode($value);
      }
      echo json_encode(
        array(
          'nonce' => wp_create_nonce('wp_rest'),
          'cookies' => implode('; ', $cookieArray)
        )
      );`
    );
  }

  await login(handler);
  const nonceResponse = await handler.request({
    url: '/get_rest_auth_data.php',
  });
  return {
    'X-WP-Nonce': nonceResponse.json.nonce,
    'cookie': nonceResponse.json.cookies
  };
};


describe('Workshop Tests', () => {
  let cliServer: RunCLIServer;
  let handler: PHPRequestHandler;
  let php: PHP;
  beforeEach(async () => {
    cliServer = await runCLI({
      command: 'server',
      mount: [
        '.:/wordpress/wp-content/plugins/wceu-playground-tester',
        './debug.log:/wordpress/wp-content/debug.log'
      ],
      login: true,
      blueprint: {
        steps: [
          {
            step: 'activatePlugin',
            pluginPath: '/wordpress/wp-content/plugins/wceu-playground-tester',
          }
        ],
      },
    });
    handler = cliServer.requestHandler;
    php = await handler.getPrimaryPhp();
  });
  afterEach(async () => {
    if (cliServer) {
      await cliServer.server.close();
    }
  });
  test('Should activate plugin', async () => {
    const activePlugins = await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(get_option('active_plugins'));
      `,
    });
    expect(activePlugins.json).toContain(
      'wceu-playground-tester/wceu-playground-tester.php'
    );
  });

  test('Should correctly generate response message', async () => {
    const result = await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(array(
          'message' => WCEUPT\\hello_response_message('John Doe')
        ));
      `,
    });
    expect(result.json.message).toBe('User says: John Doe');
  });
  test('Should load wp-admin page', async () => {
    await login(handler);

    const response = await handler.request({
      url: '/wp-admin/admin.php?page=workshop-tests',
    });
    expect(response.text).toContain('<h1>Workshop Tests</h1>');
  });

  test('Should fail to get API endpoint response for non-logged in user', async () => {
    const response = await handler.request({
      url: `/wp-json/wceupt/v1/hello`,
      method: 'POST',
      body: { name: 'John Doe' },
    });
    expect(response.httpStatusCode).toBe(401);
  });
  test('Should get API endpoint response for logged in user', async () => {
    const authHeaders = await getRestAuthHeaders(handler, php);
    const apiResponse = await handler.request({
      url: `/wp-json/wceupt/v1/hello`,
      method: 'POST',
      headers: authHeaders,
      body: { name: 'John Doe' },
    });

    expect(apiResponse.httpStatusCode).toBe(200);
    expect(apiResponse.json.success).toBe(true);
    expect(
      apiResponse.json.message
    ).toContain('User says: John Doe');
  });

  test('Should fail to get API endpoint response if name is not provided', async () => {
    const authHeaders = await getRestAuthHeaders(handler, php);
    const apiResponse = await handler.request({
      url: `/wp-json/wceupt/v1/hello`,
      method: 'POST',
      headers: authHeaders,
    });

    expect(apiResponse.httpStatusCode).toBe(400);
  });

  test('Should sanitize API request input', async () => {
    const authHeaders = await getRestAuthHeaders(handler, php);
    const apiResponse = await handler.request({
      url: `/wp-json/wceupt/v1/hello`,
      method: 'POST',
      headers: authHeaders,
      body: { name: '<script>alert("XSS")</script>' },
    });

    expect(apiResponse.httpStatusCode).toBe(200);
    expect(apiResponse.json.success).toBe(true);
    expect(
      apiResponse.json.message
    ).toBe('User says: ');
  });

  test('Should save message after API request', async () => {
    const authHeaders = await getRestAuthHeaders(handler, php);
    await handler.request({
      url: `/wp-json/wceupt/v1/hello`,
      method: 'POST',
      headers: authHeaders,
      body: { name: 'John Doe' },
    });

    const result = await php.run({
      code: `
        <?php
        require_once '/wordpress/wp-load.php';
        echo json_encode(array(
          'message' => WCEUPT\\get_messages()
        ));
      `,
    });
    expect(result.json.message.length).toBe(1);
    expect(result.json.message[0]).toBe('User says: John Doe');
  });
});
