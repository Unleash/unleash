/* eslint-disable no-console */
import type { Logger } from '../../lib/logger';

let muteError = false;
let verbose = false;
function noLoggerProvider(): Logger {
    // do something with the name
    return {
        debug: verbose ? console.log : () => {},
        info: verbose ? console.log : () => {},
        warn: verbose ? console.warn : () => {},
        error: muteError ? () => {} : console.error,
        fatal: console.error,
    };
}

noLoggerProvider.setMuteError = (mute: boolean) => {
    muteError = mute;
};

// use for debugging only, try not to commit tests with verbose set to true
noLoggerProvider.setVerbose = (beVerbose: boolean) => {
    verbose = beVerbose;
};

module.exports = noLoggerProvider;
export default noLoggerProvider;
