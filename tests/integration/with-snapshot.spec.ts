import { runCLI, RunCLIServer } from "@wp-playground/cli";
import { SupportedPHPVersions, type PHP, type PHPRequestHandler } from "@php-wasm/universal";
import { copyFileSync, readFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import * as unzipper from "unzipper";
import { createReadStream } from "fs";

const snapshotPath = resolve("./tests/integration/snapshot.zip");
const snapshotDir = resolve("./tests/integration/snapshot");
const wpConfigPath = join(snapshotDir, "wordpress", "wp-config.php");

describe("Using Snapshots", () => {
	let cliServer: RunCLIServer;
	let handler: PHPRequestHandler;
	let php: PHP;

	beforeAll(async () => {
		try {
			await runCLI({
				command: "build-snapshot",
				outfile: snapshotPath,
				quiet: true,
			});
		} catch (error) {
			// runCLI exits with a error that needs to be fixed in Playground
			// Error: process.exit unexpectedly called with "0"
		}

		// extract the snapshot zip
		await createReadStream(snapshotPath)
			.pipe(unzipper.Extract({ path: snapshotDir }))
			.promise();

		// Create the wp-config.php file
		copyFileSync(
			join(snapshotDir, "wordpress", "wp-config-sample.php"),
			wpConfigPath
		);

		// remove the zip file
		unlinkSync(snapshotPath);
	}, 60000); // allow 60 seconds for the snapshot to be created

	SupportedPHPVersions.forEach(phpVersion => {
		describe(`PHP ${phpVersion}`, () => {
			beforeEach(async () => {
				const blueprint = JSON.parse(
				  readFileSync(resolve("./blueprint.json"), "utf8")
				);
				cliServer = await runCLI({
					command: "server",
					mountBeforeInstall: [
						{
							hostPath: join(snapshotDir, "wordpress"),
							vfsPath: "/wordpress",
						},
					],
					blueprint,
					mount: [
					  {
						hostPath: "./",
						vfsPath: "/wordpress/wp-content/plugins/playground-testing-demo",
					  },
					],
					php: phpVersion,
					skipWordPressSetup: true,
					quiet: true,
				});
				handler = cliServer.requestHandler;
				php = await handler.getPrimaryPhp();
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
		});
	});
});