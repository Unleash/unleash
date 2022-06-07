const semver = require('semver');
// @ts-expect-error
const pck = require('../package.json');

const newUnleashVersion = process.argv[2];
const frontendVersion = pck.dependencies['unleash-frontend'];

function isPrerelease(version) {
    const arr = semver.prerelease(version);
    return arr && arr.length > 0;
}

if (!newUnleashVersion) {
    console.error('You must provide the new Unleash version as argument');
    process.exit(1);
}

if (!isPrerelease(newUnleashVersion)) {
    if (isPrerelease(frontendVersion)) {
        console.error(
            `A latest version of unleash-server (${newUnleashVersion}) cannot depend on a pre-release of unleash-frontend (${frontendVersion})`,
        );
        process.exit(1);
    }
}

console.log(
    ` Passed!\x1b[36m unleash-server v${newUnleashVersion}\x1b[0m can depend on\x1b[36m unleash-frontend v${frontendVersion}\x1b[0m`,
);
