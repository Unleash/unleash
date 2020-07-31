'use strict';

// export module version
require('pkginfo')(module, 'version');

const { version } = module.exports;
module.exports = version;
