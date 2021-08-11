// export module version
require('pkginfo')(module, 'version');

const { version } = module.exports;
export default version;
module.exports = version;
