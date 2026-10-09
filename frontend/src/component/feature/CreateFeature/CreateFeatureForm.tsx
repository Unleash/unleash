import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { type FormEvent, useMemo, useState } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router';
import {
    Button,
    Dialog,
    styled,
    type SxProps,
    TextField,
    type Theme,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { hoursToMilliseconds } from 'date-fns';
import { RELEASE } from 'constants/featureToggleTypes';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { CreateFeatureDialogSidebar } from './CreateFeatureDialogSidebar.tsx';
import { FlagTypeFieldset } from './FlagTypeFieldset.tsx';
import { LifetimeFieldset } from './LifetimeFieldset.tsx';
import { defaultLifetimeFor } from './flagTypes.ts';
import { Section } from './CreateFeatureForm.styles.ts';
import useFeatureForm, {
    type FeatureFormInitialData,
    type Lifetime,
} from 'component/feature/hooks/useFeatureForm';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useGlobalFeatureSearch } from 'component/feature/FeatureToggleList/useGlobalFeatureSearch';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import type { CreateFeatureSchemaType } from 'openapi';
import { HeaderBreadcrumb } from 'component/common/DialogFormTemplate/HeaderBreadcrumb.tsx';
import { NamingPatternInfo } from 'component/common/DialogFormTemplate/NamingPatternInfo.tsx';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { CreateFeatureDialogProps } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { useFlagLimits } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/useFlagLimits.tsx';
import { useFeatureCreatedFeedback } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/hooks/useFeatureCreatedFeedback.ts';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';
import { INPUT_ERROR_TEXT } from 'utils/testIds';

const draftExpiry = hoursToMilliseconds(1);

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(128),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: theme.spacing(4),
    paddingBottom: theme.spacing(3),
}));

const Fields = styled(Section)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const BottomSection = styled(Section)({
    marginTop: 'auto',
});

const FormActions = styled(Section)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const underlineOnlyWhenFocused = {
    '&::before, &:hover:not(.Mui-disabled)::before': { borderBottom: 'none' },
    '&::after': { borderBottomWidth: 1 },
};

const nameInputStyles: SxProps<Theme> = {
    p: 0,
    pb: 0.5,
    fontSize: 'h1.fontSize',
    lineHeight: 1.4,
    '&::placeholder': { color: 'text.primary', opacity: 0.55 },
};

const descriptionInputStyles: SxProps<Theme> = {
    p: 0,
    pb: 0.5,
    fontSize: (theme) => theme.typography.pxToRem(16),
    color: 'text.secondary',
    '&::placeholder': { color: 'text.secondary', opacity: 0.8 },
};

export const CreateFeatureForm = ({
    open,
    onClose,
    onSuccess,
}: CreateFeatureDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig, isOss } = useUiConfig();
    const navigate = useNavigate();
    const openFeatureCreatedFeedback = useFeatureCreatedFeedback();

    const [storedFlagConfig, setStoredFlagConfig] =
        useLocalStorageState<FeatureFormInitialData>(
            'flag-creation-dialog',
            {},
            draftExpiry,
        );

    const {
        type,
        setType,
        tags,
        name,
        setName,
        project,
        setProject,
        description,
        setDescription,
        validateToggleName,
        impressionData,
        lifetime,
        setLifetime,
        getTogglePayload,
        clearErrors,
        errors,
    } = useFeatureForm({
        ...storedFlagConfig,
        lifetime:
            storedFlagConfig.lifetime ??
            defaultLifetimeFor(storedFlagConfig.type ?? RELEASE),
    });
    const { createFeatureToggle, loading } = useFeatureApi();

    const [lifetimeChosenByUser, setLifetimeChosenByUser] = useState(false);

    const selectType = (nextType: CreateFeatureSchemaType) => {
        setType(nextType);
        if (!lifetimeChosenByUser) {
            setLifetime(defaultLifetimeFor(nextType));
        }
    };

    const selectLifetime = (nextLifetime: Lifetime) => {
        setLifetime(nextLifetime);
        setLifetimeChosenByUser(true);
    };

    const flagPayload = getTogglePayload();

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(flagPayload, undefined, 2)}'`;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();
        const validToggleName = await validateToggleName();

        if (validToggleName) {
            const payload = getTogglePayload();
            try {
                await createFeatureToggle(project, payload);
                navigate(`/projects/${project}/features/${name}`);
                setToastData({
                    text: 'Flag created successfully',
                    type: 'success',
                });
                onClose();
                onSuccess?.();
                setStoredFlagConfig({});
                openFeatureCreatedFeedback();
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch(1);

    const { project: projectInfo } = useProjectOverview(project);

    const { globalFlagLimitReached, projectFlagLimitReached, limitMessage } =
        useFlagLimits({
            global: {
                limit: uiConfig.resourceLimits.featureFlags,
                count: totalFlags ?? 0,
            },
            project: {
                limit: projectInfo.featureLimit || undefined,
                count: featuresCount(projectInfo) ?? 0,
            },
        });

    const { projects } = useProjects();

    const currentProjectName = useMemo(() => {
        const projectObject = projects.find(
            (projectOption) => projectOption.id === project,
        );
        return projectObject?.name;
    }, [project, projects]);

    const onDialogClose = () => {
        setStoredFlagConfig({
            name,
            tags,
            impressionData,
            type,
            description,
            lifetime,
        });
        onClose();
    };

    const createButtonProps = {
        projectId: project,
        disabled:
            loading ||
            loadingTotalFlagCount ||
            globalFlagLimitReached ||
            projectFlagLimitReached,
        permission: CREATE_FEATURE,
        tooltipProps: { title: limitMessage, arrow: true },
    };

    return (
        <StyledDialog open={open} onClose={onDialogClose}>
            <FormTemplate
                compact
                disablePadding
                description='Feature flags are at the core of Unleash. Use them to control your feature rollouts.'
                documentationIcon={<FlagIcon />}
                documentationLink='https://docs.getunleash.io/concepts/feature-flags'
                documentationLinkLabel='Feature flags documentation'
                formatApiCode={formatApiCode}
                useFixedSidebar
                sidebar={
                    <CreateFeatureDialogSidebar
                        apiCommand={formatApiCode()}
                        onClose={onDialogClose}
                    />
                }
            >
                <StyledForm onSubmit={handleSubmit}>
                    <HeaderBreadcrumb
                        options={
                            isOss()
                                ? []
                                : projects.map((projectOption) => ({
                                      label: projectOption.name,
                                      value: projectOption.id,
                                  }))
                        }
                        value={project}
                        valueLabel={currentProjectName}
                        onChange={setProject}
                        title='New feature flag'
                    />

                    <Fields>
                        <TextField
                            variant='standard'
                            placeholder='Enter-flag-name'
                            aria-required
                            aria-details={
                                projectInfo.featureNaming?.pattern
                                    ? 'naming-pattern-info'
                                    : undefined
                            }
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                            onBlur={() => {
                                if (name) validateToggleName();
                            }}
                            onFocus={clearErrors}
                            autoFocus
                            slotProps={{
                                input: { sx: underlineOnlyWhenFocused },
                                htmlInput: {
                                    'aria-label': 'Feature flag name',
                                    sx: nameInputStyles,
                                },
                                formHelperText: {
                                    'data-testid': INPUT_ERROR_TEXT,
                                    title: errors.name,
                                },
                            }}
                            data-testid='FORM_NAME_INPUT'
                            fullWidth
                        />
                        {projectInfo.featureNaming?.pattern ? (
                            <NamingPatternInfo
                                naming={projectInfo.featureNaming}
                            />
                        ) : null}
                        <TextField
                            variant='standard'
                            placeholder='Add a line about what it does (optional)'
                            multiline
                            maxRows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            slotProps={{
                                input: { sx: underlineOnlyWhenFocused },
                                htmlInput: {
                                    'aria-label': 'Description',
                                    sx: descriptionInputStyles,
                                },
                            }}
                            data-testid='FORM_DESCRIPTION_INPUT'
                            fullWidth
                        />
                    </Fields>

                    <FlagTypeFieldset type={type} onChange={selectType} />

                    <LifetimeFieldset
                        lifetime={lifetime}
                        onChange={selectLifetime}
                    />

                    <BottomSection>
                        <Limit
                            name='feature flags'
                            limit={uiConfig.resourceLimits.featureFlags}
                            currentValue={totalFlags ?? 0}
                        />
                    </BottomSection>

                    <FormActions>
                        <Button onClick={onDialogClose}>Cancel</Button>
                        <CreateButton
                            data-testid='FORM_CREATE_BUTTON'
                            name='flag'
                            {...createButtonProps}
                        />
                    </FormActions>
                </StyledForm>
            </FormTemplate>
        </StyledDialog>
    );
};
