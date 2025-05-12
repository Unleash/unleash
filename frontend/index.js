require('pkginfo')(module, 'version');
const path = require('path');
const dirname = path.dirname(import.meta.url);
const { version } = module.exports;

module.exports = {
    publicFolder: path.join(dirname, 'build'),
    version,
};
