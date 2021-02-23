import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FooterSection } from 'react-mdl';

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
                if (versionInfo.latest && !versionInfo.isLatest) {
                    updateNotification = `Upgrade available - Latest Enterprise release: ${versionInfo.latest.enterprise}`;
                }
            } else {
                versionStr = `${name} ${versionInfo.current.oss}`;
                if (versionInfo.latest && !versionInfo.isLatest) {
                    updateNotification = `Upgrade available - Latest OSS release: ${versionInfo.latest.oss}`;
                }
            }
            instanceId = versionInfo.instanceId;
        } else {
            versionStr = `${name} ${version}`;
        }
        return (
            <FooterSection type="bottom" logo={`${versionStr}`}>
                <small>{environment ? `(${environment})` : ''}</small>
                <br />
                <small>{updateNotification ? `${updateNotification}` : ''}</small>
                <br />
                <small>{slogan}</small>
                <br />
                <small>{instanceId ? `${instanceId}` : ''}</small>
            </FooterSection>
        );
    }
}

export default ShowApiDetailsComponent;
