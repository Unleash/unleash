/* eslint-disable no-console */

import { Logger } from '../../lib/logger';

let muteError = false;

function noLoggerProvider(): Logger {
    // do something with the name
    return {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: muteError ? () => {} : console.error,
        fatal: console.error,
    };
}

noLoggerProvider.setMuteError = (mute) => {
    muteError = mute;
};

module.exports = noLoggerProvider;
export default noLoggerProvider;
