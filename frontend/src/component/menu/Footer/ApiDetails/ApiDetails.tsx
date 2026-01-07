import type { ReactElement } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
    const { name, version, buildNumber } = formatCurrentVersion(props.uiConfig);
    const { environment, billing } = props.uiConfig;
    const updateNotification = formatUpdateNotification(props.uiConfig);

    const displayVersion = buildNumber ? (
        <small>build {buildNumber}</small>
    ) : (
        version
    );
    return (
        <section title='API details'>
            <FooterTitle>
                {name} {environment ? environment : ''}
                {billing === 'pay-as-you-go' ? ' Pay-as-You-Go' : ''}{' '}
                {displayVersion}
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
