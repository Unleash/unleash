import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FooterSection, FooterLinkList } from 'react-mdl';

class ShowApiDetailsComponent extends Component {
    static propTypes = {
        apiDetails: PropTypes.object.isRequired,
        fetchAll: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchAll();
    }

    render() {
        const version = this.props.apiDetails.version || '';
        return (
            <FooterSection type="bottom" logo={`Unleash ${version}`}>
                <FooterLinkList>
                    <a href="https://github.com/Unleash/unleash/" target="_blank">
                        GitHub
                    </a>
                    <a href="https://www.finn.no" target="_blank">
                        <small>A product by</small> FINN.no
                    </a>
                </FooterLinkList>
            </FooterSection>
        );
    }
}

export default ShowApiDetailsComponent;
