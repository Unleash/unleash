import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { createStrategy, updateStrategy } from '../../store/strategy/actions';

import AddStrategy from './from-strategy';
import { loadNameFromHash } from '../common/util';

class WrapperComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            strategy: this.props.strategy,
            errors: {},
            dirty: false,
        };
    }

    appParameter = () => {
        const { strategy } = this.state;
        strategy.parameters = [...strategy.parameters, {}];
        this.setState({ strategy, dirty: true });
    };

    updateParameter = (index, updated) => {
        const { strategy } = this.state;

        // 1. Make a shallow copy of the items
        let parameters = [...strategy.parameters];
        // 2. Make a shallow copy of the item you want to mutate
        let item = { ...parameters[index] };
        // 3. Replace the property you're intested in
        // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
        parameters[index] = Object.assign({}, item, updated);
        // 5. Set the state to our new copy
        strategy.parameters = parameters;
        this.setState({ strategy });
    };

    setValue = (field, value) => {
        const { strategy } = this.state;
        strategy[field] = value;
        this.setState({ strategy, dirty: true });
    };

    onSubmit = async evt => {
        evt.preventDefault();
        const { createStrategy, updateStrategy, history, editMode } = this.props;
        const { strategy } = this.state;

        const parameters = (strategy.parameters || [])
            .filter(({ name }) => !!name)
            .map(({ name, type = 'string', description = '', required = false }) => ({
                name,
                type,
                description,
                required,
            }));

        strategy.parameters = parameters;

        if (editMode) {
            await updateStrategy(strategy);
            history.push(`/strategies/view/${strategy.name}`);
        } else {
            await createStrategy(strategy);
            history.push(`/strategies`);
        }
    };

    onCancel = evt => {
        evt.preventDefault();
        const { history, editMode } = this.props;
        const { strategy } = this.state;

        if (editMode) {
            history.push(`/strategies/view/${strategy.name}`);
        } else {
            history.push('/strategies');
        }
    };

    render() {
        return (
            <AddStrategy
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                setValue={this.setValue}
                updateParameter={this.updateParameter}
                appParameter={this.appParameter}
                input={this.state.strategy}
                errors={this.state.errors}
                editMode={this.props.editMode}
            />
        );
    }
}
WrapperComponent.propTypes = {
    history: PropTypes.object.isRequired,
    createStrategy: PropTypes.func.isRequired,
    updateStrategy: PropTypes.func.isRequired,
    strategy: PropTypes.object,
    editMode: PropTypes.bool,
};

const mapDispatchToProps = { createStrategy, updateStrategy };

const mapStateToProps = (state, props) => {
    const { strategy, editMode } = props;
    return {
        strategy: strategy ? strategy : { name: loadNameFromHash(), description: '', parameters: [] },
        editMode,
    };
};

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(WrapperComponent);

export default FormAddContainer;
