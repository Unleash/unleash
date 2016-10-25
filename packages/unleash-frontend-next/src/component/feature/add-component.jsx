import React, { Component, PropTypes } from 'react';
import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';
import Switch from 'react-toolbox/lib/switch';
import SelectStrategies from './strategies-for-toggle-container';
import SelectedStrategies from './selected-strategies';

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
            addStrategy,
            removeStrategy,
            onSubmit,
            onCancel,
            editmode = false,
        } = this.props;

        const {
            name, // eslint-disable-line
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

                <section>
                    <div>
                        <h5 style={{
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                            paddingBottom: '5px',
                            marginBottom: '10px',
                        }}>Strategies:</h5>
                    </div>

                    <SelectedStrategies
                        configuredStrategies={configuredStrategies}
                        removeStrategy={removeStrategy} />
                </section>

                <section>
                    <SelectStrategies addStrategy={addStrategy} />
                </section>

                <br />

                <Button type="submit" raised primary label={editmode ? 'Update' : 'Create'} />
                &nbsp;
                <Button type="cancel" raised label="Cancel" onClick={onCancel} />
            </form>
        );
    }

};

AddFeatureToggleComponent.propTypes = {
    strategies: PropTypes.array.required,
    input: PropTypes.object,
    setValue: PropTypes.func.required,
    addStrategy: PropTypes.func.required,
    removeStrategy: PropTypes.func.required,
    onSubmit: PropTypes.func.required,
    onCancel: PropTypes.func.required,
    editmode: PropTypes.bool,
};

export default AddFeatureToggleComponent;
