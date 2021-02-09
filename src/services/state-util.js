const fs = require('fs');
const mime = require('mime');
const YAML = require('js-yaml');

const readFile = file => {
    return new Promise((resolve, reject) =>
        fs.readFile(file, (err, v) => (err ? reject(err) : resolve(v))),
    );
};

const parseFile = (file, data) => {
    return mime.getType(file) === 'text/yaml'
        ? YAML.safeLoad(data)
        : JSON.parse(data);
};

const filterExisitng = (keepExisting, exitingArray) => {
    return item => {
        if (keepExisting) {
            const found = exitingArray.find(t => t.name === item.name);
            return !found;
        }
        return true;
    };
};

const filterEqual = exitingArray => {
    return item => {
        const toggle = exitingArray.find(t => t.name === item.name);
        if (toggle) {
            return JSON.stringify(toggle) !== JSON.stringify(item);
        }
        return true;
    };
};

module.exports = {
    readFile,
    parseFile,
    filterExisitng,
    filterEqual,
};
