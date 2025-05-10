import { runCLI } from "@wp-playground/cli";

export const runPlayground = async () => {
    return await runCLI({
        command: "server",
        mount: [
            "./debug.log:/wordpress/wp-content/debug.log",
            ".:/wordpress/wp-content/plugins/wceu-playground-tester",
        ],
        blueprint: {
            login: true,
            steps: [
                {
                    step: "activatePlugin",
                    pluginPath: "/wordpress/wp-content/plugins/wceu-playground-tester",
                },
            ],
        },
    });
}