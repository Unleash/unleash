import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { Button, Icon, TextField, Switch, Paper, FormControlLabel } from '@material-ui/core';

import { styles as commonStyles } from '../../common';
import styles from './copy-feature-component.module.scss';

import { trim } from '../../common/util';

class CopyFeatureComponent extends Component {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;

    constructor() {
        super();
        this.state = { newToggleName: '', replaceGroupId: true };
        this.inputRef = React.createRef();
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
        // TODO unwind this stuff
        if (this.props.copyToggle) {
            this.setState({ featureToggle: this.props.copyToggle });
        }
    }

    componentDidMount() {
        if (this.props.copyToggle) {
            this.inputRef.current.focus();
        } else {
            this.props.fetchFeatureToggles();
        }
    }

    setValue = evt => {
        const value = trim(evt.target.value);
        this.setState({ newToggleName: value });
    };

    toggleReplaceGroupId = () => {
        const { replaceGroupId } = !!this.state;
        this.setState({ replaceGroupId });
    };

    onValidateName = async () => {
        const { newToggleName } = this.state;
        try {
            await this.props.validateName(newToggleName);
            this.setState({ nameError: undefined });
        } catch (err) {
            this.setState({ nameError: err.message });
        }
    };

    onSubmit = evt => {
        evt.preventDefault();

        const { nameError, newToggleName, replaceGroupId } = this.state;
        if (nameError) {
            return;
        }

        const { copyToggle, history } = this.props;

        copyToggle.name = newToggleName;

        if (replaceGroupId) {
            copyToggle.strategies.forEach(s => {
                if (s.parameters && s.parameters.groupId) {
                    s.parameters.groupId = newToggleName;
                }
            });
        }

        this.props.createFeatureToggle(copyToggle).then(() => history.push(`/features/strategies/${copyToggle.name}`));
    };

    render() {
        const { copyToggle } = this.props;

        if (!copyToggle) return <span>Toggle not found</span>;

        const { newToggleName, nameError, replaceGroupId } = this.state;

        return (
            <Paper className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <div className={styles.header}>
                    <h1>Copy&nbsp;{copyToggle.name}</h1>
                </div>

                <section className={styles.content}>
                    <p className={styles.text}>
                        You are about to create a new feature toggle by cloning the configuration of feature
                        toggle&nbsp;
                        <Link to={`/features/strategies/${copyToggle.name}`}>{copyToggle.name}</Link>. You must give the
                        new feature toggle a unique name before you can proceed.
                    </p>
                    <form onSubmit={this.onSubmit}>
                        <TextField
                            label="Feature toggle name"
                            name="name"
                            value={newToggleName}
                            error={nameError}
                            onBlur={this.onValidateName}
                            onChange={this.setValue}
                            error={nameError !== undefined}
                            helperText={nameError}
                            variant="outlined"
                            size="small"
                            inputRef={this.inputRef}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    value={replaceGroupId}
                                    checked={replaceGroupId}
                                    label="Replace groupId"
                                    onChange={this.toggleReplaceGroupId}
                                />
                            }
                            label="Replace groupId"
                        />

                        <Button type="submit" color="primary" variant="contained">
                            <Icon>file_copy</Icon>
                            &nbsp;&nbsp;&nbsp; Create from copy
                        </Button>
                    </form>
                </section>
            </Paper>
        );
    }
}

CopyFeatureComponent.propTypes = {
    copyToggle: PropTypes.object,
    history: PropTypes.object.isRequired,
    createFeatureToggle: PropTypes.func.isRequired,
    fetchFeatureToggles: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
};

export default CopyFeatureComponent;
