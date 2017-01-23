import React, { Component, PropTypes } from 'react';
import { Textfield, Switch, Grid, Cell } from 'react-mdl';
import StrategiesSection from './strategies-section-container';

import { FormButtons, HeaderTitle } from '../../common';

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
            moveStrategy,
            onSubmit,
            onCancel,
            editmode = false,
            title,
        } = this.props;

        const {
            name, // eslint-disable-line
            nameError,
            description,
            enabled,
        } = input;
        const configuredStrategies = input.strategies || [];

        return (
            <Grid className="mdl-color--white">
                <Cell col={12}>
                    <form onSubmit={onSubmit(input)}>
                        {title && <HeaderTitle title={title} />}
                        <section>
                            <Textfield
                                floatingLabel
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
                                floatingLabel
                                style={{ width: '100%' }}
                                rows={1}
                                label="Description"
                                required
                                value={description}
                                onChange={(v) => setValue('description', v.target.value)} />

                            {!editmode && <div>
                                <br />
                                <Switch
                                checked={enabled}
                                onChange={() => {
                                    setValue('enabled', !enabled);
                                }}>Enabled</Switch>
                                <hr />
                            </div>}
                        </section>

                        <StrategiesSection
                            configuredStrategies={configuredStrategies}
                            addStrategy={addStrategy}
                            updateStrategy={updateStrategy}
                            moveStrategy={moveStrategy}
                            removeStrategy={removeStrategy} />

                        <br />
                        <FormButtons
                            submitText={editmode ? 'Update' : 'Create'}
                            onCancel={onCancel}
                        />
                    </form>
                </Cell>
            </Grid>
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
