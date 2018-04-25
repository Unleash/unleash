import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Switch, Card, CardTitle, CardActions } from 'react-mdl';
import StrategiesSection from './strategies-section-container';

import { FormButtons } from './../../common';
import { styles as commonStyles } from '../../common';

const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

class AddFeatureComponent extends Component {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;
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
        } = this.props;

        const {
            name, // eslint-disable-line
            nameError,
            description,
            enabled,
        } = input;
        const configuredStrategies = input.strategies || [];

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>Create feature toggle</CardTitle>
                <form onSubmit={onSubmit(input)}>
                    <section style={{ padding: '16px' }}>
                        <Textfield
                            floatingLabel
                            label="Name"
                            name="name"
                            required
                            value={name}
                            error={nameError}
                            onBlur={v => validateName(v.target.value)}
                            onChange={v => setValue('name', trim(v.target.value))}
                        />
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            required
                            value={description}
                            onChange={v => setValue('description', v.target.value)}
                        />
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

                        <StrategiesSection
                            configuredStrategies={configuredStrategies}
                            addStrategy={addStrategy}
                            updateStrategy={updateStrategy}
                            moveStrategy={moveStrategy}
                            removeStrategy={removeStrategy}
                        />

                        <br />
                    </section>
                    <CardActions>
                        <FormButtons submitText={'Create'} onCancel={onCancel} />
                    </CardActions>
                </form>
            </Card>
        );
    }
}

AddFeatureComponent.propTypes = {
    input: PropTypes.object,
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

export default AddFeatureComponent;
