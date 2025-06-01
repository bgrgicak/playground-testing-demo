import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;
const __filename = new URL(import.meta.url).pathname;

