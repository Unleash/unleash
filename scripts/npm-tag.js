const semver = require('semver');

const latestUnleashVersion = process.argv[2];

const version = require('../package.json').version;

function isPrerelease(version) {
    const arr = semver.prerelease(version);
    return arr && arr.length > 0;
}

if(isPrerelease(version)){
    console.log('beta')
}else if(semver.gt(version, latestUnleashVersion)) {
    console.log('latest');
} else {
    console.log('previous');
}