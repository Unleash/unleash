const {
    enrich,
    mapObject,
    modifyContent,
    getRepoData,
    getUrls,
} = require('./remote-content/shared');

const DOCS = mapObject(enrich)({
    'unleash-proxy': {
        sidebarName: 'Unleash Proxy',
        slugName: 'unleash-proxy',
    },
    'unleash-edge': {
        sidebarName: 'Unleash Edge',
        slugName: 'unleash-edge',
    },
});

const getAdmonitions = (data) => {
    const admonitions = {
        'unleash-proxy': `:::tip

Looking for how to run the Unleash proxy? Check out the [_how to run the Unleash proxy_ guide](../how-to/how-to-run-the-unleash-proxy.mdx)!

:::`, 'unleash-edge': `:::caution
Unleash Edge is currently considered very experimental. Run it at your own risk
:::`
    }

    return [admonitions[data.slugName]]
};

const modifyContent2 = modifyContent({
    getRepoDataFn: getRepoData(DOCS),
    urlPath: '/reference/',
    getAdditionalAdmonitions: getAdmonitions,
});

module.exports.externalDocs = {
    urls: getUrls(DOCS),
    modifyContent: modifyContent2,
};
