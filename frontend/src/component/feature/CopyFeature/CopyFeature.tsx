import { useState, FormEventHandler, ChangeEventHandler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    TextField,
    Switch,
    Paper,
    FormControlLabel,
    Alert,
    styled,
} from '@mui/material';
import { FileCopy } from '@mui/icons-material';
import { styles as themeStyles } from 'component/common';
import { formatUnknownError } from 'utils/formatUnknownError';
import { trim } from 'component/common/util';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { getTogglePath } from 'utils/routePathHelpers';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestsEnabled } from '../../../hooks/useChangeRequestsEnabled';

const StyledPage = styled(Paper)(({ theme }) => ({
    overflow: 'visible',
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(3, 4),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.medium,
}));

const StyledSection = styled('section')(({ theme }) => ({
    padding: theme.spacing(4),
}));

const StyledDescription = styled('p')(({ theme }) => ({
    marginTop: 0,
    marginBottom: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(3),
    maxWidth: theme.spacing(50),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
}));

export const CopyFeatureToggle = () => {
    const [replaceGroupId, setReplaceGroupId] = useState(true);
    const [apiError, setApiError] = useState('');
    const [nameError, setNameError] = useState<string | undefined>();
    const [newToggleName, setNewToggleName] = useState<string>();
    const { cloneFeatureToggle, validateFeatureToggleName } = useFeatureApi();
    const featureId = useRequiredPathParam('featureId');
    const projectId = useRequiredPathParam('projectId');
    const { feature } = useFeature(projectId, featureId);
    const navigate = useNavigate();
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(projectId);

    const setValue: ChangeEventHandler<HTMLInputElement> = event => {
        const value = trim(event.target.value);
        setNewToggleName(value);
    };

    const toggleReplaceGroupId = () => {
        setReplaceGroupId(prev => !prev);
    };

    const onValidateName = async () => {
        try {
            await validateFeatureToggleName(newToggleName);
            setNameError(undefined);
            return true;
        } catch (error) {
            setNameError(formatUnknownError(error));
        }
        return false;
    };

    const onSubmit: FormEventHandler = async event => {
        event.preventDefault();

        const isValidName = await onValidateName();

        if (!isValidName) {
            return;
        }

        try {
            await cloneFeatureToggle(projectId, featureId, {
                name: newToggleName as string,
                replaceGroupId,
            });
            navigate(getTogglePath(projectId, newToggleName as string));
        } catch (error) {
            setApiError(formatUnknownError(error));
        }
    };

    if (!feature || !feature.name) return <span>Toggle not found</span>;

    return (
        <StyledPage className={themeStyles.fullwidth}>
            <StyledHeader>
                <StyledTitle>Copy&nbsp;{featureId}</StyledTitle>
            </StyledHeader>
            <ConditionallyRender
                condition={Boolean(apiError)}
                show={<Alert severity="error">{apiError}</Alert>}
            />
            <StyledSection>
                <StyledDescription>
                    You are about to create a new feature toggle by cloning the
                    configuration of feature toggle&nbsp;
                    <Link to={getTogglePath(projectId, featureId)}>
                        {featureId}
                    </Link>
                    . You must give the new feature toggle a unique name before
                    you can proceed.
                </StyledDescription>
                <StyledForm onSubmit={onSubmit}>
                    <TextField
                        label="Name"
                        name="name"
                        value={newToggleName || ''}
                        onBlur={onValidateName}
                        onChange={setValue}
                        error={nameError !== undefined}
                        helperText={nameError}
                        variant="outlined"
                        size="small"
                        aria-required
                        autoFocus
                    />
                    <StyledFormControlLabel
                        control={
                            <Switch
                                value={replaceGroupId}
                                checked={replaceGroupId}
                                onChange={toggleReplaceGroupId}
                            />
                        }
                        label="Replace groupId"
                    />

                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isChangeRequestConfiguredInAnyEnv()}
                    >
                        <FileCopy />
                        &nbsp;&nbsp;&nbsp; Create from copy
                    </Button>
                </StyledForm>
            </StyledSection>
        </StyledPage>
    );
};
