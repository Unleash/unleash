import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FooterSection } from 'react-mdl';

class ShowApiDetailsComponent extends Component {
    static propTypes = {
        uiConfig: PropTypes.object.isRequired,
    };

    render() {
        const { slogan, environment, version, name } = this.props.uiConfig;

        return (
            <FooterSection type="bottom" logo={`${name} ${version}`}>
                <small>{environment ? `(${environment})` : ''}</small>
                <br />
                <small>{slogan}</small>
            </FooterSection>
        );
    }
}

export default ShowApiDetailsComponent;
