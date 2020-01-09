import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Switch, Card, CardTitle, CardActions } from 'react-mdl';
import StrategiesSection from './strategies-section-container';

import { FormButtons } from './../../common';
import { styles as commonStyles } from '../../common';
import { trim } from './util';

class AddFeatureComponent extends Component {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;
    componentDidMount() {
        window.onbeforeunload = () => 'Data will be lost if you leave the page, are you sure?';
    }

    render() {
        const {
            input,
            errors,
            setValue,
            validateName,
            addStrategy,
            removeStrategy,
            updateStrategy,
            moveStrategy,
            onSubmit,
            onCancel,
        } = this.props;

        const configuredStrategies = input.strategies || [];

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>Create new feature toggle</CardTitle>
                <form onSubmit={onSubmit}>
                    <section style={{ padding: '16px' }}>
                        <Textfield
                            floatingLabel
                            label="Name"
                            name="name"
                            value={input.name}
                            error={errors.name}
                            onBlur={v => validateName(v.target.value)}
                            onChange={v => setValue('name', trim(v.target.value))}
                        />
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            error={errors.description}
                            value={input.description}
                            onChange={v => setValue('description', v.target.value)}
                        />
                        <div>
                            <br />
                            <Switch
                                checked={input.enabled}
                                onChange={() => {
                                    setValue('enabled', !input.enabled);
                                }}
                            >
                                Enabled
                            </Switch>
                            <br />
                            <br />
                        </div>

                        {input.name ? (
                            <StrategiesSection
                                configuredStrategies={configuredStrategies}
                                featureToggleName={input.name}
                                addStrategy={addStrategy}
                                updateStrategy={updateStrategy}
                                moveStrategy={moveStrategy}
                                removeStrategy={removeStrategy}
                            />
                        ) : null}

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
    errors: PropTypes.object,
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
