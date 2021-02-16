import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Chip, Textfield, Card, CardTitle, CardText, CardActions, Checkbox } from 'react-mdl';

import { FormButtons, styles as commonStyles } from '../common';
import { trim } from '../common/util';

class AddContextComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contextField: props.contextField,
            errors: {},
            currentLegalValue: '',
            dirty: false,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.contextField.name && props.contextField.name) {
            return { contextField: props.contextField };
        } else {
            return null;
        }
    }

    setValue = (field, value) => {
        const { contextField } = this.state;
        contextField[field] = value;
        this.setState({ contextField, dirty: true });
    };

    validateContextName = async name => {
        const { errors } = this.state;
        const { validateName } = this.props;
        try {
            await validateName(name);
            errors.name = undefined;
        } catch (err) {
            errors.name = err.message;
        }

        this.setState({ errors });
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/context');
    };

    onSubmit = evt => {
        evt.preventDefault();
        const { contextField } = this.state;
        this.props.submit(contextField).then(() => this.props.history.push('/context'));
    };

    updateCurrentLegalValue = evt => {
        this.setState({ currentLegalValue: trim(evt.target.value) });
    };

    addLegalValue = evt => {
        evt.preventDefault();
        const { contextField, currentLegalValue, errors } = this.state;

        if (contextField.legalValues.indexOf(currentLegalValue) !== -1) {
            errors.currentLegalValue = 'Duplicate legal value';
            this.setState({ errors });
            return;
        }

        const legalValues = contextField.legalValues.concat(trim(currentLegalValue));
        contextField.legalValues = legalValues;
        this.setState({
            contextField,
            currentLegalValue: '',
            errors: {},
        });
    };

    removeLegalValue = index => {
        const { contextField } = this.state;
        const legalValues = contextField.legalValues.filter((_, i) => i !== index);
        contextField.legalValues = legalValues;
        this.setState({ contextField });
    };

    renderLegalValue = (value, index) => (
        <Chip
            key={`${value}:${index}`}
            className="mdl-color--blue-grey-100"
            style={{ marginRight: '4px' }}
            onClose={() => this.removeLegalValue(index)}
        >
            {value}
        </Chip>
    );

    render() {
        const { contextField, errors } = this.state;
        const { editMode } = this.props;
        const submitText = editMode ? 'Update' : 'Create';

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', paddingBottom: '0', wordBreak: 'break-all' }}>
                    Create context field
                </CardTitle>
                <CardText>
                    Context fields are a basic building block used in Unleash to control roll-out. They can be used
                    together with strategy constraints as part of the activation strategy evaluation.
                </CardText>
                <form onSubmit={this.onSubmit}>
                    <section style={{ padding: '16px' }}>
                        <Textfield
                            floatingLabel
                            label="Name"
                            name="name"
                            value={contextField.name}
                            error={errors.name}
                            disabled={editMode}
                            onBlur={v => this.validateContextName(v.target.value)}
                            onChange={v => this.setValue('name', trim(v.target.value))}
                        />
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            error={errors.description}
                            value={contextField.description}
                            onChange={v => this.setValue('description', v.target.value)}
                        />
                        <br />
                        <br />
                        <section style={{ padding: '16px', background: '#fafafa' }}>
                            <h6 style={{ marginTop: '0' }}>Legal values</h6>
                            <p style={{ color: 'rgba(0,0,0,.54)' }}>
                                By defining the legal values the Unleash Admin UI will validate the user input. A
                                concrete example would be that we know all values for our “environment” (local,
                                development, stage, production).
                            </p>
                            <Textfield
                                floatingLabel
                                label="Value"
                                name="value"
                                style={{ width: '130px' }}
                                value={this.state.currentLegalValue}
                                error={errors.currentLegalValue}
                                onChange={this.updateCurrentLegalValue}
                            />
                            <Button onClick={this.addLegalValue}>Add</Button>
                            <div>{contextField.legalValues.map(this.renderLegalValue)}</div>
                        </section>
                        <br />
                        <section style={{ padding: '16px' }}>
                            <h6 style={{ marginTop: '0' }}>Custom stickiness (beta)</h6>
                            <p style={{ color: 'rgba(0,0,0,.54)' }}>
                                By enabling stickiness on this context field you can use it together with the
                                flexible-rollout strategy. This will guarantee a consistent behavior for specific values
                                of this context field. PS! Not all client SDK's support this feature yet!{' '}
                                <a
                                    href="https://unleash.github.io/docs/activation_strategy#flexiblerollout"
                                    target="_blank"
                                >
                                    Read more
                                </a>
                            </p>
                            <Checkbox
                                label="Allow stickiness"
                                ripple
                                checked={contextField.stickiness}
                                onChange={() => this.setValue('stickiness', !contextField.stickiness)}
                            />
                        </section>
                    </section>
                    <CardActions>
                        <FormButtons submitText={submitText} onCancel={this.onCancel} />
                    </CardActions>
                </form>
            </Card>
        );
    }
}

AddContextComponent.propTypes = {
    contextField: PropTypes.object.isRequired,
    validateName: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default AddContextComponent;
