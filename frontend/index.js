require('pkginfo')(module, 'version');
const path = require('path');

const { version } = module.exports;

module.exports = {
    publicFolder: path.join(import.meta.dirname, 'build'),
    version,
};
