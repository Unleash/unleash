import { IUiConfig } from 'interfaces/uiConfig';

export const getUniqueChangeRequestId = (
    uiConfig: Pick<IUiConfig, 'baseUriPath' | 'versionInfo'>,
    changeRequestId: number,
) => {
    return `${
        uiConfig.baseUriPath || uiConfig.versionInfo?.instanceId
    }/change-requests/${changeRequestId}?version=${uiConfig.versionInfo}`;
};
