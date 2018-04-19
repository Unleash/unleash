import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StrategiesSection from './strategies-section-container';

import { FormButtons } from './../../common';

class UpdateFeatureComponent extends Component {
    // static displayName = `UpdateFeatureComponent-{getDisplayName(Component)}`;
    componentWillMount() {
        // TODO unwind this stuff
        if (this.props.initCallRequired === true) {
            this.props.init(this.props.input);
        }
    }

    render() {
        const {
            input,
            features,
            addStrategy,
            removeStrategy,
            updateStrategy,
            moveStrategy,
            onSubmit,
            onCancel,
        } = this.props;
        const {
            name, // eslint-disable-line
        } = input;
        const configuredStrategies = input.strategies || [];

        return (
            <form onSubmit={onSubmit(input, features)}>
                <section style={{ padding: '16px' }}>
                    <StrategiesSection
                        configuredStrategies={configuredStrategies}
                        addStrategy={addStrategy}
                        updateStrategy={updateStrategy}
                        moveStrategy={moveStrategy}
                        removeStrategy={removeStrategy}
                    />

                    <br />
                    <FormButtons submitText={'Update'} onCancel={onCancel} />
                </section>
            </form>
        );
    }
}

UpdateFeatureComponent.propTypes = {
    input: PropTypes.object,
    features: PropTypes.array,
    setValue: PropTypes.func.isRequired,
    addStrategy: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    moveStrategy: PropTypes.func.isRequired,
    updateStrategy: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    initCallRequired: PropTypes.bool,
    init: PropTypes.func,
};

export default UpdateFeatureComponent;
