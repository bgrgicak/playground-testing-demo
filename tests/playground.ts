import { runCLI } from '@wp-playground/cli';
import fs from 'fs';
import path from 'path';
import { PHPRequest, PHPRequestHandler } from '@php-wasm/universal';
import { login } from '@wp-playground/blueprints';

export const runPlayground = async () => {
    const blueprint = JSON.parse(fs.readFileSync(
        path.resolve('./tests/blueprint.json'),
        'utf8'
    ));
    return await runCLI({
        mount: ['.:/wordpress/wp-content/plugins/playground-testing-demo/'],
        blueprint,
        command: 'server',
    });
};

export const getAuthHeaders = async (handler: PHPRequestHandler) => {
    const php = await handler.getPrimaryPhp();
    if (!await php.fileExists('/wordpress/rest-auth-headers.php')) {
        await php.writeFile('/wordpress/rest-auth-headers.php', `<?php
            require_once '/wordpress/wp-load.php';
            $cookie = '';
            foreach ($_COOKIE as $key => $value) {
                $cookie .= $key . '=' . $value . '; ';
            }
            echo json_encode(array(
                'X-WP-Nonce' => wp_create_nonce('wp_rest'),
                'cookie' => $cookie,
            ));
        `);
    }
    await login(php, {
        username: 'admin',
    });
    const response = await requestFollowsRedirects(handler, {
        url: '/rest-auth-headers.php',
        method: 'GET',
    });
    return response.json;
}

export const requestFollowsRedirects = async (handler: PHPRequestHandler, request: PHPRequest) => {
    const response = await handler.request(request);
    if (response.httpStatusCode === 302) {
        return requestFollowsRedirects(handler, {
            url: response.headers.location[0],
        });
    }
    return response;
}