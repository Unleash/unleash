import { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Chip,
    TextField,
    Switch,
    Icon,
    Typography,
} from '@material-ui/core';
import styles from './Context.module.scss';
import classnames from 'classnames';
import { FormButtons, styles as commonStyles } from '../common';
import { trim } from '../common/util';
import PageContent from '../common/PageContent/PageContent';
import ConditionallyRender from '../common/ConditionallyRender';
import { Alert } from '@material-ui/lab';

const sortIgnoreCase = (a, b) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) return 0;
    if (a > b) return 1;
    return -1;
};

class AddContextComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contextField: props.contextField,
            errors: {},
            currentLegalValue: '',
            dirty: false,
            focusedLegalValue: false,
        };
    }

    handleKeydown = e => {
        if (e.key === 'Enter' && this.state.focusedLegalValue) {
            this.addLegalValue(e);
        } else if (e.key === 'Enter') {
            this.onSubmit(e);
        }
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeydown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeydown);
    }

    static getDerivedStateFromProps(props, state) {
        if (state.contextField.initial && !props.contextField.initial) {
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
        const { validateName, editMode } = this.props;

        if (editMode) return true;

        try {
            await validateName(name);
            errors.name = undefined;
        } catch (err) {
            errors.name = err.message;
        }
        this.setState({ errors });
        if (errors.name) return false;
        return true;
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/context');
    };

    onSubmit = async evt => {
        evt.preventDefault();
        const { contextField } = this.state;

        const valid = await this.validateContextName(contextField.name);

        if (valid) {
            this.props
                .submit(contextField)
                .then(() => this.props.history.push('/context'))
                .catch(e =>
                    this.setState(prev => ({
                        ...prev,
                        errors: { api: e.toString() },
                    }))
                );
        }
    };

    updateCurrentLegalValue = evt => {
        this.setState({ currentLegalValue: trim(evt.target.value) });
    };

    addLegalValue = evt => {
        evt.preventDefault();
        const { contextField, currentLegalValue, errors } = this.state;

        if (!currentLegalValue) {
            return;
        }

        if (contextField.legalValues.indexOf(currentLegalValue) !== -1) {
            errors.currentLegalValue = 'Duplicate legal value';
            this.setState({ errors });
            return;
        }

        const legalValues = contextField.legalValues.concat(
            trim(currentLegalValue)
        );
        contextField.legalValues = legalValues.sort(sortIgnoreCase);
        this.setState({
            contextField,
            currentLegalValue: '',
            errors: {},
        });
    };

    removeLegalValue = index => {
        const { contextField } = this.state;
        const legalValues = contextField.legalValues.filter(
            (_, i) => i !== index
        );
        contextField.legalValues = legalValues;
        this.setState({ contextField });
    };

    renderLegalValue = (value, index) => (
        <Chip
            key={`${value}:${index}`}
            className={styles.chip}
            onDelete={() => this.removeLegalValue(index)}
            label={value}
        />
    );

    render() {
        const { contextField, errors } = this.state;
        const { editMode } = this.props;
        const submitText = editMode ? 'Update' : 'Create';

        return (
            <PageContent headerContent="Create context field">
                <div className={styles.supporting}>
                    Context fields are a basic building block used in Unleash to
                    control roll-out. They can be used together with strategy
                    constraints as part of the activation strategy evaluation.
                </div>
                <form onSubmit={this.onSubmit}>
                    <section className={styles.formContainer}>
                        <ConditionallyRender
                            condition={errors.api}
                            show={
                                <Alert severity="error">
                                    {this.state.errors.api}
                                </Alert>
                            }
                        />
                        <TextField
                            className={commonStyles.fullwidth}
                            label="Name"
                            name="name"
                            defaultValue={contextField.name}
                            error={errors.name}
                            helperText={errors.name}
                            disabled={editMode}
                            variant="outlined"
                            size="small"
                            onBlur={v =>
                                this.validateContextName(v.target.value)
                            }
                            onChange={v =>
                                this.setValue('name', trim(v.target.value))
                            }
                        />
                        <TextField
                            className={commonStyles.fullwidth}
                            rowsMax={1}
                            label="Description"
                            error={errors.description}
                            helperText={errors.description}
                            variant="outlined"
                            size="small"
                            defaultValue={contextField.description}
                            onChange={v =>
                                this.setValue('description', v.target.value)
                            }
                        />
                        <br />
                        <br />
                    </section>
                    <section className={styles.inset}>
                        <h6 className={styles.h6}>Legal values</h6>
                        <p className={styles.alpha}>
                            By defining the legal values the Unleash Admin UI
                            will validate the user input. A concrete example
                            would be that we know all values for our
                            “environment” (local, development, stage,
                            production).
                        </p>
                        <div>
                            <TextField
                                label="Value"
                                name="value"
                                className={styles.valueField}
                                onFocus={() =>
                                    this.setState(prev => ({
                                        ...prev,
                                        focusedLegalValue: true,
                                    }))
                                }
                                onBlur={() =>
                                    this.setState(prev => ({
                                        ...prev,
                                        focusedLegalValue: false,
                                    }))
                                }
                                value={this.state.currentLegalValue}
                                error={!!errors.currentLegalValue}
                                helperText={errors.currentLegalValue}
                                variant="outlined"
                                size="small"
                                onChange={this.updateCurrentLegalValue}
                            />
                            <Button
                                className={styles.legalValueButton}
                                startIcon={<Icon>add</Icon>}
                                onClick={this.addLegalValue}
                                variant="contained"
                                color="primary"
                            >
                                Add
                            </Button>
                        </div>
                        <div>
                            {contextField.legalValues.map(
                                this.renderLegalValue
                            )}
                        </div>
                    </section>
                    <br />
                    <section>
                        <Typography variant="subtitle1">
                            Custom stickiness (beta)
                        </Typography>
                        <p
                            className={classnames(
                                styles.alpha,
                                styles.formContainer
                            )}
                        >
                            By enabling stickiness on this context field you can
                            use it together with the flexible-rollout strategy.
                            This will guarantee a consistent behavior for
                            specific values of this context field. PS! Not all
                            client SDK's support this feature yet!{' '}
                            <a
                                href="https://unleash.github.io/docs/activation_strategy#flexiblerollout"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Read more
                            </a>
                        </p>
                        {console.log(contextField.stickiness)}
                        <Switch
                            label="Allow stickiness"
                            checked={contextField.stickiness}
                            value={contextField.stickiness}
                            onChange={() =>
                                this.setValue(
                                    'stickiness',
                                    !contextField.stickiness
                                )
                            }
                        />
                    </section>
                    <div className={styles.formButtons}>
                        <FormButtons
                            submitText={submitText}
                            onCancel={this.onCancel}
                        />
                    </div>
                </form>
            </PageContent>
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
