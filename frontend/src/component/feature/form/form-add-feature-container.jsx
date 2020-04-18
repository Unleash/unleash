import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import arrayMove from 'array-move';
import { createFeatureToggles, validateName } from './../../../store/feature-actions';
import AddFeatureComponent from './form-add-feature-component';
import { loadNameFromHash } from './util';

const defaultStrategy = { name: 'default' };

class WrapperComponent extends Component {
    constructor(props) {
        super(props);
        const name = loadNameFromHash();
        this.state = {
            featureToggle: { name, description: '', strategies: [], enabled: true },
            errors: {},
            dirty: false,
        };
    }

    setValue = (field, value) => {
        const { featureToggle } = this.state;
        featureToggle[field] = value;
        this.setState({ featureToggle, dirty: true });
    };

    validateName = async featureToggleName => {
        const { errors } = this.state;
        try {
            await validateName(featureToggleName);
            errors.name = undefined;
        } catch (err) {
            errors.name = err.message;
        }

        this.setState({ errors });
    };

    addStrategy = strat => {
        strat.id = Math.round(Math.random() * 10000000);
        const { featureToggle } = this.state;
        const strategies = featureToggle.strategies.concat(strat);
        featureToggle.strategies = strategies;
        this.setState({ featureToggle, dirty: true });
    };

    moveStrategy = (index, toIndex) => {
        const { featureToggle } = this.state;
        const strategies = arrayMove(featureToggle.strategies, index, toIndex);
        featureToggle.strategies = strategies;
        this.setState({ featureToggle, dirty: true });
    };

    removeStrategy = index => {
        const { featureToggle } = this.state;
        const strategies = featureToggle.strategies.filter((_, i) => i !== index);
        featureToggle.strategies = strategies;
        this.setState({ featureToggle, dirty: true });
    };

    updateStrategy = (index, strat) => {
        const { featureToggle } = this.state;
        const strategies = featureToggle.strategies.concat();
        strategies[index] = strat;
        featureToggle.strategies = strategies;
        this.setState({ featureToggle, dirty: true });
    };

    onSubmit = evt => {
        evt.preventDefault();
        const { createFeatureToggles, history } = this.props;
        const { featureToggle } = this.state;
        featureToggle.createdAt = new Date();

        if (Array.isArray(featureToggle.strategies) && featureToggle.strategies.length > 0) {
            featureToggle.strategies.forEach(s => {
                delete s.id;
            });
        } else {
            featureToggle.strategies = [defaultStrategy];
        }

        createFeatureToggles(featureToggle).then(() => history.push(`/features/strategies/${featureToggle.name}`));
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/features');
    };

    render() {
        return (
            <AddFeatureComponent
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                addStrategy={this.addStrategy}
                updateStrategy={this.updateStrategy}
                removeStrategy={this.removeStrategy}
                moveStrategy={this.moveStrategy}
                validateName={this.validateName}
                setValue={this.setValue}
                input={this.state.featureToggle}
                errors={this.state.errors}
            />
        );
    }
}
WrapperComponent.propTypes = {
    history: PropTypes.object.isRequired,
    createFeatureToggles: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    validateName: name => validateName(name)(dispatch),
    createFeatureToggles: featureToggle => createFeatureToggles(featureToggle)(dispatch),
});

const FormAddContainer = connect(() => ({}), mapDispatchToProps)(WrapperComponent);

export default FormAddContainer;
