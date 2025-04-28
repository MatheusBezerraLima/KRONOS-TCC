// utils/paths.js
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirnameCurrent = dirname(__filename);

const __dirname = path.resolve(__dirnameCurrent, '../..');

export { __dirname };
