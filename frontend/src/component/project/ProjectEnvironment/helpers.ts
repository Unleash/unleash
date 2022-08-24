import { IProjectEnvironment } from 'interfaces/environments';

export const getEnabledEnvs = (envs: IProjectEnvironment[]) => {
    return envs.reduce((enabledEnvs, currentEnv) => {
        if (currentEnv.enabled) {
            return enabledEnvs + 1;
        }
        return enabledEnvs;
    }, 0);
};
