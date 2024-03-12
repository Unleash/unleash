import type { IUiConfig } from 'interfaces/uiConfig';

export const getUniqueChangeRequestId = (
    uiConfig: Pick<IUiConfig, 'baseUriPath' | 'versionInfo'>,
    changeRequestId: number,
) =>
    `${
        uiConfig.baseUriPath || uiConfig.versionInfo?.instanceId
    }#${changeRequestId}`;
