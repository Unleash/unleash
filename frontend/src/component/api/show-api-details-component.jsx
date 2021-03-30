import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

class ShowApiDetailsComponent extends Component {
    static propTypes = {
        uiConfig: PropTypes.object.isRequired,
    };

    render() {
        const { slogan, environment, version, versionInfo, name } = this.props.uiConfig;
        let versionStr;
        let updateNotification;
        let instanceId;
        if (versionInfo) {
            if (versionInfo.current.enterprise) {
                versionStr = `${name} ${versionInfo.current.enterprise}`;
                if (Object.keys(versionInfo.latest).includes('enterprise') && !versionInfo.isLatest) {
                    updateNotification = `Upgrade available - Latest Enterprise release: ${versionInfo.latest.enterprise}`;
                }
            } else {
                versionStr = `${name} ${versionInfo.current.oss}`;
                if (Object.keys(versionInfo.latest).includes('oss') && !versionInfo.isLatest) {
                    updateNotification = `Upgrade available - Latest OSS release: ${versionInfo.latest.oss}`;
                }
            }
            instanceId = versionInfo.instanceId;
        } else {
            versionStr = `${name} ${version}`;
        }
        return (
            <section title="API details">
                <h4>{`${versionStr}`}</h4>
                <ConditionallyRender condition={environment} show={<small>`(${environment})`</small>} />
                <br />
                <ConditionallyRender condition={updateNotification} show={<small>{updateNotification}`</small>} />
                <br />
                <br />
                <small>{slogan}</small>
                <br />
                <ConditionallyRender condition={instanceId} show={<small>{`${instanceId}`}</small>} />
            </section>
        );
    }
}

export default ShowApiDetailsComponent;
