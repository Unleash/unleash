import React, { Component, PropTypes } from 'react';
import { Textfield, Button, Switch, Icon } from 'react-mdl';
import StrategiesSection from './strategies-section-container';

const trim = (value) => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

class AddFeatureToggleComponent extends Component {

    componentWillMount () {
        // TODO unwind this stuff
        if (this.props.initCallRequired === true) {
            this.props.init(this.props.input);
        }
    }

    render () {
        const {
            input,
            setValue,
            validateName,
            addStrategy,
            removeStrategy,
            updateStrategy,
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
                <section>
                    <Textfield
                        label="Name"
                        name="name"
                        disabled={editmode}
                        required
                        value={name}
                        error={nameError}
                        onBlur={(v) => validateName(v.target.value)}
                        onChange={(v) => setValue('name', trim(v.target.value))} />
                    <br />
                    <Textfield
                        rows={2}
                        label="Description"
                        required
                        value={description}
                        onChange={(v) => setValue('description', v.target.value)} />

                    <br />

                    <Switch
                        checked={enabled}
                        onChange={(v) => {
                                                // todo is wrong way to get value?
                            setValue('enabled', (console.log(v.target) && v.target.value === 'on'));
                        }}>Enabled</Switch>
                    <br />
                </section>

                <StrategiesSection
                    configuredStrategies={configuredStrategies}
                    addStrategy={addStrategy}
                    updateStrategy={updateStrategy}
                    removeStrategy={removeStrategy} />

                <br />
                <Button type="submit" ripple raised primary icon="add">
                    <Icon name="add" />&nbsp;&nbsp;&nbsp;
                    {editmode ? 'Update' : 'Create'}
                </Button>
                &nbsp;
                <Button type="cancel" ripple raised onClick={onCancel} style={{ float: 'right' }}>
                    <Icon name="cancel" />&nbsp;&nbsp;&nbsp;
                    Cancel
                </Button>
            </form>
        );
    }

};

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
