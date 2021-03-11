interface IExperimentalFlags {
    [key: string]: boolean;
}

interface IConfig {
    experimental: IExperimentalFlags;
}

export const isRbacEnabled = (config: IConfig): boolean => {
    return config && config.experimental && config.experimental.rbac;
};

module.exports = { isRbacEnabled };
