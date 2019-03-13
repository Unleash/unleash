import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StrategiesSection from './strategies-section-container';
import { Button, Icon } from 'react-mdl';

class ViewFeatureComponent extends Component {
    render() {
        const { input, onCancel } = this.props;
        const configuredStrategies = input.strategies || [];

        return (
            <section style={{ padding: '16px' }}>
                <StrategiesSection configuredStrategies={configuredStrategies} />
                <br />
                <Button type="cancel" ripple raised onClick={onCancel} style={{ float: 'right' }}>
                    <Icon name="cancel" />
                    &nbsp;&nbsp;&nbsp; Cancel
                </Button>
            </section>
        );
    }
}

ViewFeatureComponent.propTypes = {
    input: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    initCallRequired: PropTypes.bool,
    init: PropTypes.func,
};

export default ViewFeatureComponent;
