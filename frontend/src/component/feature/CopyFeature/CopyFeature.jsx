import { useState, useRef, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
    Button,
    TextField,
    Switch,
    Paper,
    FormControlLabel,
} from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import { styles as commonStyles } from 'component/common';
import styles from './CopyFeature.module.scss';
import { trim } from 'component/common/util';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { Alert } from '@material-ui/lab';
import { getTogglePath } from 'utils/routePathHelpers';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const CopyFeatureToggle = () => {
    const [replaceGroupId, setReplaceGroupId] = useState(true);
    const [apiError, setApiError] = useState('');
    const [nameError, setNameError] = useState(undefined);
    const [newToggleName, setNewToggleName] = useState();
    const { cloneFeatureToggle, validateFeatureToggleName } = useFeatureApi();
    const inputRef = useRef();
    const { name: copyToggleName, id: projectId } = useParams();
    const { feature } = useFeature(projectId, copyToggleName);
    const { uiConfig } = useUiConfig();
    const history = useHistory();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const setValue = evt => {
        const value = trim(evt.target.value);
        setNewToggleName(value);
    };

    const toggleReplaceGroupId = () => {
        setReplaceGroupId(prev => !prev);
    };

    const onValidateName = async () => {
        try {
            await validateFeatureToggleName(newToggleName);

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

        try {
            await cloneFeatureToggle(projectId, copyToggleName, {
                name: newToggleName,
                replaceGroupId,
            });
            history.push(
                getTogglePath(projectId, newToggleName, uiConfig.flags.E)
            );
        } catch (e) {
            setApiError(e.toString());
        }
    };

    if (!feature || !feature.name) return <span>Toggle not found</span>;

    return (
        <Paper
            className={commonStyles.fullwidth}
            style={{ overflow: 'visible' }}
        >
            <div className={styles.header}>
                <h1>Copy&nbsp;{copyToggleName}</h1>
            </div>
            <ConditionallyRender
                condition={apiError}
                show={<Alert severity="error">{apiError}</Alert>}
            />
            <section className={styles.content}>
                <p className={styles.text}>
                    You are about to create a new feature toggle by cloning the
                    configuration of feature toggle&nbsp;
                    <Link to={getTogglePath(projectId, copyToggleName)}>
                        {copyToggleName}
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
                        required
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
