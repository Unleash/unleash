import React, { Component, PropTypes } from 'react';
import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';
import Switch from 'react-toolbox/lib/switch';
import StrategiesSection from './strategies-section-container';

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
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        disabled={editmode}
                        required
                        value={name}
                        error={nameError}
                        onBlur={(v) => validateName(v)}
                        onChange={(v) => setValue('name', v)} />
                    <Input
                        type="text"
                        multiline label="Description"
                        required
                        value={description}
                        onChange={(v) => setValue('description', v)} />

                    <br />

                    <Switch
                        checked={enabled}
                        label="Enabled"
                        onChange={(v) => setValue('enabled', v)} />
                    <br />
                </section>

                <StrategiesSection
                    configuredStrategies={configuredStrategies}
                    addStrategy={addStrategy}
                    updateStrategy={updateStrategy}
                    removeStrategy={removeStrategy} />

                <br />

                <hr />

                <Button type="submit" raised primary label={editmode ? 'Update' : 'Create'} />
                &nbsp;
                <Button type="cancel" raised label="Cancel" onClick={onCancel} />
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
