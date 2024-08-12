import type { ReactElement } from 'react';
import {
    formatCurrentVersion,
    formatUpdateNotification,
    type IPartialUiConfig,
} from './apidetails.helpers';
import { FooterTitle } from 'component/menu/Footer/FooterTitle';

interface IApiDetailsProps {
    uiConfig: IPartialUiConfig;
}

export const ApiDetails = (props: IApiDetailsProps): ReactElement => {
    const instanceId = props.uiConfig.versionInfo?.instanceId;
    const currentVersion = formatCurrentVersion(props.uiConfig);
    const environment = props.uiConfig.environment;
    const updateNotification = formatUpdateNotification(props.uiConfig);

    return (
        <section title='API details'>
            <FooterTitle>
                {currentVersion}{' '}
                {environment ? <small>({environment})</small> : null}
            </FooterTitle>
            {updateNotification ? (
                <small>
                    {updateNotification}
                    <br />
                </small>
            ) : null}
            <br />
            <small>{props.uiConfig.slogan}</small>
            <br />
            {instanceId ? <small>{`${instanceId}`}</small> : null}
        </section>
    );
};
