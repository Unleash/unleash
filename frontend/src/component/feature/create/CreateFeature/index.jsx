import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    createFeatureToggles,
    validateName,
} from '../../../../store/feature-toggle/actions';
import CreateFeature from './CreateFeature';
import { loadNameFromHash } from '../../../common/util';

const defaultStrategy = {
    name: 'default',
    parameters: {},
};

function resolveCurrentProjectId(settings) {
    if (!settings.currentProjectId) {
        return 'default';
    } else if (settings.currentProjectId === '*') {
        return 'default';
    } else {
        return settings.currentProjectId;
    }
}

class WrapperComponent extends Component {
    constructor(props) {
        super();
        const name = loadNameFromHash();
        this.state = {
            featureToggle: {
                name,
                description: '',
                type: 'release',
                stale: false,
                strategies: [],
                variants: [],
                enabled: true,
                project: props.currentProjectId,
            },
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
        const { errors } = {...this.state};
        try {
            await validateName(featureToggleName);
            errors.name = undefined;
        } catch (err) {
            errors.name = err.message;
        }

        this.setState({ errors });
    };

    onSubmit = evt => {
        evt.preventDefault();
        const { createFeatureToggles, history } = this.props;
        const { featureToggle } = this.state;

        const errors = Object.values(this.state.errors).filter(i => i);

        if (errors.length > 0) {
            return;
        }

        if (featureToggle.strategies < 1) {
            featureToggle.strategies = [defaultStrategy];
        }


        createFeatureToggles(featureToggle).then(() =>
            history.push(`/features/strategies/${featureToggle.name}`)
        );
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/features');
    };

    render() {
        return (
            <CreateFeature
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                validateName={this.validateName}
                setValue={this.setValue}
                setStrategies={this.setStrategies}
                input={this.state.featureToggle}
                errors={this.state.errors}
                user={this.props.user}
            />
        );
    }
}
WrapperComponent.propTypes = {
    history: PropTypes.object.isRequired,
    createFeatureToggles: PropTypes.func.isRequired,
    currentProjectId: PropTypes.string.isRequired,
};

const mapDispatchToProps = dispatch => ({
    validateName: name => validateName(name)(dispatch),
    createFeatureToggles: featureToggle =>
        createFeatureToggles(featureToggle)(dispatch),
});

const mapStateToProps = state => {
    const settings = state.settings.toJS().feature || {};
    const currentProjectId = resolveCurrentProjectId(settings);

    return { currentProjectId, user: state.user.toJS() };
};

const FormAddContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(WrapperComponent);

export default FormAddContainer;
