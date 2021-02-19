interface ExperimentalFlags {
    [key: string]: boolean;
}

interface Config {
    experimental: ExperimentalFlags;
}

export const isRbacEnabled = (config: Config): boolean => {
    return config && config.experimental && config.experimental.rbac;
};

module.exports = { isRbacEnabled };
