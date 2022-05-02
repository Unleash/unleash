import { ReactElement } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    formatCurrentVersion,
    formatUpdateNotification,
    IPartialUiConfig,
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
        <section title="API details">
            <FooterTitle>
                {currentVersion}{' '}
                <ConditionallyRender
                    condition={Boolean(environment)}
                    show={<small>({environment})</small>}
                />
            </FooterTitle>
            <ConditionallyRender
                condition={Boolean(updateNotification)}
                show={
                    <small>
                        {updateNotification}
                        <br />
                    </small>
                }
            />
            <br />
            <small>{props.uiConfig.slogan}</small>
            <br />
            <ConditionallyRender
                condition={Boolean(instanceId)}
                show={<small>{`${instanceId}`}</small>}
            />
        </section>
    );
};
