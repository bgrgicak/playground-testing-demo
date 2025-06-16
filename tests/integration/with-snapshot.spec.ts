import { runCLI, RunCLIServer } from "@wp-playground/cli";
import type { PHP, PHPRequestHandler } from "@php-wasm/universal";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { login } from "@wp-playground/blueprints";

const snapshotPath = "./tests/integration/snapshot.zip";

describe.only("Using Snapshots", () => {
	let cliServer: RunCLIServer;
	let handler: PHPRequestHandler;
	let php: PHP;

	beforeAll(async () => {
		// Use existing snapshot if it exists
		if (existsSync(snapshotPath)) {
			return;
		}
		try {
			await runCLI({
				command: "build-snapshot",
				blueprint: {
					"steps": [
						{
							"step": "installTheme",
							"themeData": {
								"resource": "wordpress.org/themes",
								"slug": "pendant"
							},
							"options": {
								"activate": true,
								"importStarterContent": true
							}
						},
					]
				},
				outfile: snapshotPath,
			});
		} catch (error) {
			// runCLI exits with a error that needs to be fixed in Playground
			// Error: process.exit unexpectedly called with "0"
		}
	});
	beforeEach(async () => {
		cliServer = await runCLI({
			command: "server",
			mount: [
				{
					hostPath: snapshotPath,
					vfsPath: "/tmp/snapshot.zip",
				},
				{
					hostPath: "./",
					vfsPath: "/tmp/playground-testing-demo",
				},
			],
			blueprint: {
				"steps": [
					{
						"step": "unzip",
						"zipFile": {
							"resource": "vfs",
							"path": "/tmp/snapshot.zip"
						},
						"extractToPath": "/"
					},
					// {
					//     "step": "cp",
					//     "fromPath": "/tmp/playground-testing-demo",
					//     "toPath": "/wordpress/wp-content/plugins/playground-testing-demo"
					// },
					// {
					//     "step": "activatePlugin",
					//     "pluginPath": "/wordpress/wp-content/plugins/playground-testing-demo/playground-testing-demo.php"
					// },
				]
			},
			// skipSqliteSetup: true,
			// skipWordPressSetup: true,
			quiet: true,
		});
		handler = cliServer.requestHandler;
		php = await handler.getPrimaryPhp();
		await login(php, {
			username: "admin",
		});
	});
	test("Pendant theme should be active", async () => {
		const result = await php.run({
			code: `<?php
				require_once '/wordpress/wp-load.php';
				$themes = get_themes();
				echo json_encode($themes);
			`,
		});
		expect(result.json).toContain("pendant");
	});
});