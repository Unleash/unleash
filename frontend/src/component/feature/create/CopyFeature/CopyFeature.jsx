import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Link, useParams } from 'react-router-dom';

import {
    Button,
    TextField,
    Switch,
    Paper,
    FormControlLabel,
} from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';

import { styles as commonStyles } from '../../../common';
import styles from './CopyFeature.module.scss';

import { trim } from '../../../common/util';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { Alert } from '@material-ui/lab';
import { getTogglePath } from '../../../../utils/route-path-helpers';

const CopyFeature = props => {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;
    const [replaceGroupId, setReplaceGroupId] = useState(true);
    const [apiError, setApiError] = useState('');
    const [copyToggle, setCopyToggle] = useState();
    const [nameError, setNameError] = useState(undefined);
    const [newToggleName, setNewToggleName] = useState();
    const inputRef = useRef();
    const { name } = useParams();
    const copyToggleName = name;

    const { features } = props;

    useEffect(() => {
        const copyToggle = features.find(item => item.name === copyToggleName);
        if (copyToggle) {
            setCopyToggle(copyToggle);

            inputRef.current?.focus();
        } else {
            props.fetchFeatureToggles();
        }
        /* eslint-disable-next-line */
    }, [features.length]);

    const setValue = evt => {
        const value = trim(evt.target.value);
        setNewToggleName(value);
    };

    const toggleReplaceGroupId = () => {
        setReplaceGroupId(prev => !prev);
    };

    const onValidateName = async () => {
        try {
            await props.validateName(newToggleName);

            setNameError(undefined);
        } catch (err) {
            setNameError(err.message);
        }
    };

    const onSubmit = async evt => {
        evt.preventDefault();

        if (nameError) {
            return;
        }

        const { history } = props;
        copyToggle.name = newToggleName;

        if (replaceGroupId) {
            copyToggle.strategies.forEach(s => {
                if (s.parameters && s.parameters.groupId) {
                    s.parameters.groupId = newToggleName;
                }
            });
        }

        try {
            props
                .createFeatureToggle(copyToggle)
                .then(() =>
                    history.push(
                        getTogglePath(copyToggle.project, copyToggle.name)
                    )
                );
        } catch (e) {
            setApiError(e);
        }
    };

    if (!copyToggle) return <span>Toggle not found</span>;

    return (
        <Paper
            className={commonStyles.fullwidth}
            style={{ overflow: 'visible' }}
        >
            <div className={styles.header}>
                <h1>Copy&nbsp;{copyToggle.name}</h1>
            </div>
            <ConditionallyRender
                condition={apiError}
                show={<Alert severity="error">{apiError}</Alert>}
            />
            <section className={styles.content}>
                <p className={styles.text}>
                    You are about to create a new feature toggle by cloning the
                    configuration of feature toggle&nbsp;
                    <Link
                        to={getTogglePath(copyToggle.project, copyToggle.name)}
                    >
                        {copyToggle.name}
                    </Link>
                    . You must give the new feature toggle a unique name before
                    you can proceed.
                </p>
                <form onSubmit={onSubmit}>
                    <TextField
                        label="Feature toggle name"
                        name="name"
                        value={newToggleName || ''}
                        onBlur={onValidateName}
                        onChange={setValue}
                        error={nameError !== undefined}
                        helperText={nameError}
                        variant="outlined"
                        size="small"
                        inputRef={inputRef}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                value={replaceGroupId}
                                checked={replaceGroupId}
                                label="Replace groupId"
                                onChange={toggleReplaceGroupId}
                            />
                        }
                        label="Replace groupId"
                    />

                    <Button type="submit" color="primary" variant="contained">
                        <FileCopy />
                        &nbsp;&nbsp;&nbsp; Create from copy
                    </Button>
                </form>
            </section>
        </Paper>
    );
};

CopyFeature.propTypes = {
    copyToggle: PropTypes.object,
    history: PropTypes.object.isRequired,
    createFeatureToggle: PropTypes.func.isRequired,
    fetchFeatureToggles: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
};

export default CopyFeature;
