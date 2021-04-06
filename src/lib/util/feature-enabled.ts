import { IUnleashConfig } from '../types/core';

export const isRbacEnabled = (config: IUnleashConfig): boolean => {
    return config && config.experimental && config.experimental.rbac;
};

module.exports = { isRbacEnabled };
