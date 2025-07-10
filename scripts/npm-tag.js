import semver from 'semver';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const latestUnleashVersion = process.argv[2];

function isPrerelease(version) {
    const arr = semver.prerelease(version);
    return arr && arr.length > 0;
}

if (isPrerelease(version)) {
    console.log('beta');
} else if (semver.gt(version, latestUnleashVersion)) {
    console.log('latest');
} else {
    console.log('previous');
}
