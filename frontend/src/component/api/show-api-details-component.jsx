import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FooterSection } from 'react-mdl';

class ShowApiDetailsComponent extends Component {
    static propTypes = {
        apiDetails: PropTypes.object.isRequired,
        uiConfig: PropTypes.object.isRequired,
        fetchAll: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchAll();
    }

    render() {
        const version = this.props.apiDetails.version || '';
        const { slogan, environment } = this.props.uiConfig;

        return (
            <FooterSection type="bottom" logo={`Unleash ${version}`}>
                <small>{environment ? `(${environment})` : ''}</small>
                <br />
                <small>{slogan}</small>
            </FooterSection>
        );
    }
}

export default ShowApiDetailsComponent;
