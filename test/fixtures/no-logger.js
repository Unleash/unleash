/* eslint-disable no-console */

let muteError = false;

function noLoggerProvider() {
    // do something with the name
    return {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: muteError ? () => {} : console.error,
    };
}

noLoggerProvider.setMuteError = mute => {
    muteError = mute;
};

module.exports = noLoggerProvider;
