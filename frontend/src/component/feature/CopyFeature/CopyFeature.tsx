import {
    useState,
    type FormEventHandler,
    type ChangeEventHandler,
} from 'react';
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
import FileCopy from '@mui/icons-material/FileCopy';
import { formatUnknownError } from 'utils/formatUnknownError';
import { trim } from 'component/common/util';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { getTogglePath } from 'utils/routePathHelpers';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { FeatureNamingPatternInfo } from '../FeatureNamingPatternInfo/FeatureNamingPatternInfo.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

const StyledPage = styled(Paper)(({ theme }) => ({
    overflow: 'visible',
    borderRadius: theme.shape.borderRadiusLarge,
    width: '100%',
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

const StyledAlert = styled(Alert)(({ theme }) => ({
    margin: theme.spacing(4, 4, 0),
}));

export const CopyFeatureToggle = () => {
    const [replaceGroupId, setReplaceGroupId] = useState(true);
    const [apiError, setApiError] = useState('');
    const [nameError, setNameError] = useState<string | undefined>();
    const [newToggleName, setnewToggleName] = useState<string>();
    const { cloneFeatureToggle, validateFeatureToggleName } = useFeatureApi();
    const featureId = useRequiredPathParam('featureId');
    const projectId = useRequiredPathParam('projectId');
    const { feature } = useFeature(projectId, featureId);
    const navigate = useNavigate();
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(projectId);
    const hasReleasePlan = feature.environments?.some((env) =>
        Boolean(env.releasePlans?.length),
    );

    const {
        project: { featureNaming },
    } = useProjectOverview(projectId);

    const setValue: ChangeEventHandler<HTMLInputElement> = (event) => {
        const value = trim(event.target.value);
        setnewToggleName(value);
    };

    const toggleReplaceGroupId = () => {
        setReplaceGroupId((prev) => !prev);
    };

    const onValidateName = async () => {
        try {
            await validateFeatureToggleName(newToggleName, projectId);
            setNameError(undefined);
            return true;
        } catch (error) {
            setNameError(formatUnknownError(error));
        }
        return false;
    };

    const onSubmit: FormEventHandler = async (event) => {
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

    const displayFeatureNamingInfo = Boolean(featureNaming?.pattern);

    return (
        <StyledPage>
            <StyledHeader>
                <StyledTitle>Copy&nbsp;{featureId}</StyledTitle>
            </StyledHeader>
            <ConditionallyRender
                condition={Boolean(apiError)}
                show={<Alert severity='error'>{apiError}</Alert>}
            />
            <ConditionallyRender
                condition={isChangeRequestConfiguredInAnyEnv()}
                show={
                    <StyledAlert severity='error'>
                        Copy functionality is disabled for this project because
                        change request is enabled for at least one environment
                        in this project.
                    </StyledAlert>
                }
            />
            <ConditionallyRender
                condition={hasReleasePlan}
                show={
                    <StyledAlert severity='warning'>
                        Cloning a feature flag will not clone the associated
                        release plans. You will need to set up a new release
                        plan for the cloned feature flag.
                    </StyledAlert>
                }
            />
            <StyledSection>
                <StyledDescription>
                    You are about to create a new feature flag by cloning the
                    configuration of feature flag&nbsp;
                    <Link to={getTogglePath(projectId, featureId)}>
                        {featureId}
                    </Link>
                    . You must give the new feature flag a unique name before
                    you can proceed.
                </StyledDescription>

                <ConditionallyRender
                    condition={displayFeatureNamingInfo}
                    show={
                        <FeatureNamingPatternInfo
                            featureNaming={featureNaming!}
                        />
                    }
                />
                <StyledForm onSubmit={onSubmit}>
                    <TextField
                        label='Name'
                        name='name'
                        value={newToggleName || ''}
                        onBlur={onValidateName}
                        onChange={setValue}
                        error={nameError !== undefined}
                        helperText={nameError}
                        variant='outlined'
                        size='small'
                        aria-required
                        aria-details={
                            displayFeatureNamingInfo
                                ? 'feature-naming-pattern-info'
                                : undefined
                        }
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
                        label='Replace groupId'
                    />

                    <Button
                        type='submit'
                        color='primary'
                        variant='contained'
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
