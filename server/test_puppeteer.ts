import { evaluateSubmission, closeBrowser } from "./src/services/evaluator.js";
import fs from "fs";

async function main() {
    try {
        console.log("Testing evaluation...");
        const result = await evaluateSubmission(
            { html: "<h1>Test</h1>", css: "", js: "" },
            null,
            "Test"
        );
        console.log("Success:", result.score);
    } catch (err: any) {
        fs.writeFileSync('test_error.json', JSON.stringify({message: err.message, stack: err.stack}, null, 2));
    } finally {
        await closeBrowser();
    }
}

main();
