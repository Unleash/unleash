'use strict';

module.exports = () => {
    const _settings = [];
    return {
        insert: setting => {
            _settings.push(setting);
            return Promise.resolve();
        },
        get: name => {
            const setting = _settings.find(s => s.name === name);
            if (setting) {
                return Promise.resolve(setting.content);
            }
            return Promise.reject(new Error('Could not find setting'));
        },
    };
};
