import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Switch } from 'react-mdl';
import StrategiesSection from './strategies-section-container';

import { FormButtons } from '../../common';

const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

class AddFeatureToggleComponent extends Component {
    componentWillMount() {
        // TODO unwind this stuff
        if (this.props.initCallRequired === true) {
            this.props.init(this.props.input);
        }
    }

    render() {
        const {
            input,
            setValue,
            validateName,
            addStrategy,
            removeStrategy,
            updateStrategy,
            moveStrategy,
            onSubmit,
            onCancel,
            editmode = false,
        } = this.props;

        const {
            name, // eslint-disable-line
            nameError,
            description,
            enabled,
        } = input;
        const configuredStrategies = input.strategies || [];

        return (
            <form onSubmit={onSubmit(input)}>
                <section style={{ padding: '16px' }}>
                    <Textfield
                        floatingLabel
                        label="Name"
                        name="name"
                        disabled={editmode}
                        required
                        value={name}
                        error={nameError}
                        onBlur={v => validateName(v.target.value)}
                        onChange={v => setValue('name', trim(v.target.value))}
                    />
                    <br />
                    <Textfield
                        floatingLabel
                        style={{ width: '100%' }}
                        rows={1}
                        label="Description"
                        required
                        value={description}
                        onChange={v => setValue('description', v.target.value)}
                    />

                    {!editmode && (
                        <div>
                            <br />
                            <Switch
                                checked={enabled}
                                onChange={() => {
                                    setValue('enabled', !enabled);
                                }}
                            >
                                Enabled
                            </Switch>
                            <hr />
                        </div>
                    )}

                    <StrategiesSection
                        configuredStrategies={configuredStrategies}
                        addStrategy={addStrategy}
                        updateStrategy={updateStrategy}
                        moveStrategy={moveStrategy}
                        removeStrategy={removeStrategy}
                    />

                    <br />
                    <FormButtons
                        submitText={editmode ? 'Update' : 'Create'}
                        onCancel={onCancel}
                    />
                </section>
            </form>
        );
    }
}

AddFeatureToggleComponent.propTypes = {
    input: PropTypes.object,
    setValue: PropTypes.func.isRequired,
    addStrategy: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    updateStrategy: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    editmode: PropTypes.bool,
};

export default AddFeatureToggleComponent;
