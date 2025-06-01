import { runCLI } from "@wp-playground/cli";
import { PHPRequest, PHPRequestHandler } from "@php-wasm/universal";
import { readFile } from "fs/promises";
import path from "path";
import { login } from "@wp-playground/blueprints";

export const runPlayground = async () => {
    const blueprint = JSON.parse(
        await readFile(
            path.resolve("tests/blueprint.json"),
            "utf8"
        )
    );
    return await runCLI({
        command: "server",
        mount: [
            ".:/wordpress/wp-content/plugins/playground-testing-demo",
        ],
        blueprint,
        quiet: true,
    });
}

export const getAuthHeaders = async (handler: PHPRequestHandler) => {
    const php = await handler.getPrimaryPhp();
    if (! await php.fileExists("/wordpress/get_rest_auth_data.php")) {
        await php.writeFile(
            "/wordpress/get_rest_auth_data.php",
            `<?php
            require_once '/wordpress/wp-load.php';
            $cookie= '';
            foreach ($_COOKIE as $name => $value) {
                $cookieArray .= $name . '=' . $value . '; ';
            }
            echo json_encode(
                array(
                    'X-WP-Nonce' => wp_create_nonce('wp_rest'),
                    'Cookie' => $cookie
                )
            );
            `,
        );
    }

    await login(php, {
        username: "admin",
    });
    const response = await requestFollowRedirects(handler, { url: "/get_rest_auth_data.php" });
    return response.json;
}

export const requestFollowRedirects = async (handler: PHPRequestHandler, request: PHPRequest) => {
    let response = await handler.request(request);
    while (
        [301, 302].includes(response.httpStatusCode) &&
        response.headers["location"].length === 1
    ) {
        response = await requestFollowRedirects(
            handler,
            {
                url: response.headers["location"][0],
            }
        );
    }
    return response;
}