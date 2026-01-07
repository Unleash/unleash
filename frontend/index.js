require('pkginfo')(module, 'version');
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = path.dirname(fileURLToPath(import.meta.url));
const { version } = module.exports;

module.exports = {
    publicFolder: path.join(dirname, 'build'),
    version,
};
