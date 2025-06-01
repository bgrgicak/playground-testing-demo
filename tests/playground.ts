import { runCLI } from "@wp-playground/cli";
import { readFile } from "fs/promises";
import path from "path";

export const runPlayground = async () => {
    const blueprint = JSON.parse(
        await readFile(
            path.join(__dirname, "blueprint.json"),
            "utf8"
        )
    );
    return await runCLI({
        command: "server",
        mount: [
            ".:/wordpress/wp-content/plugins/playground-testing-demo",
        ],
        blueprint,
    });
}