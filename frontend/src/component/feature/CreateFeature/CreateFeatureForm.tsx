import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { type FormEvent, useEffect, useId, useMemo, useState } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router';
import {
    Button,
    Dialog,
    styled,
    type SxProps,
    type Theme,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { hoursToMilliseconds } from 'date-fns';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { CreateFeatureDialogSidebar } from './CreateFeatureDialogSidebar.tsx';
import { FlagTypeFieldset } from './FlagTypeFieldset.tsx';
import { LifetimeFieldset } from './LifetimeFieldset.tsx';
import { NamingPatternHint } from './NamingPatternHint.tsx';
import { OptionalSettingsFieldset } from './OptionalSettingsFieldset.tsx';
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
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { CreateFeatureDialogProps } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { useFlagLimits } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/useFlagLimits.tsx';
import { useFeatureCreatedFeedback } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/hooks/useFeatureCreatedFeedback.ts';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';
import { useTracking } from 'hooks/useTracking';
import {
    type DialogDismissMethod,
    dismissMethodFromCloseReason,
    type TrackingProps,
} from 'utils/trackingEvents';
import {
    createFlagSubmitProps,
    createFlagTracking,
} from './flagCreationTracking.ts';
import { INPUT_ERROR_TEXT } from 'utils/testIds';
import { BorderlessInput } from 'component/common/Input/BorderlessInput';

const draftExpiry = hoursToMilliseconds(1);

type FlagDraft = FeatureFormInitialData & { lifetimeChosenByUser?: boolean };

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

const descriptionInputStyles: SxProps<Theme> = {
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
        useLocalStorageState<FlagDraft>(
            'flag-creation-dialog',
            {},
            draftExpiry,
        );

    const {
        tags,
        setTags,
        name,
        setName,
        project,
        setProject,
        description,
        setDescription,
        validateToggleName,
        impressionData,
        setImpressionData,
        lifetime,
        setLifetime,
        getTogglePayload,
        clearErrors,
        errors,
    } = useFeatureForm(storedFlagConfig);
    const { createFeatureToggle, loading } = useFeatureApi();

    const [type, setType] = useState(storedFlagConfig.type);
    const [typeError, setTypeError] = useState<string>();
    const [lifetimeChosenByUser, setLifetimeChosenByUser] = useState(
        storedFlagConfig.lifetimeChosenByUser ?? false,
    );

    const selectType = (nextType: CreateFeatureSchemaType) => {
        setType(nextType);
        setTypeError(undefined);
        if (!lifetimeChosenByUser) {
            setLifetime(defaultLifetimeFor(nextType));
        }
    };

    const selectLifetime = (nextLifetime: Lifetime) => {
        setLifetime(nextLifetime);
        setLifetimeChosenByUser(true);
    };

    const flagPayload = { ...getTogglePayload(), type };

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
        setTypeError(type ? undefined : 'Choose a flag type');
        const validToggleName = await validateToggleName();

        if (validToggleName && type) {
            try {
                await trackCreateFlag.mutation(
                    () => createFeatureToggle(project, flagPayload),
                    createFlagSubmitProps({
                        type,
                        lifetime,
                        lifetimeDays: flagPayload.lifetimeDays,
                        lifetimeChosenByUser,
                    }),
                );
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
        } else {
            trackCreateFlag.validationFailed();
        }
    };

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch(1);

    const { project: projectInfo } = useProjectOverview(project);
    const projectFlagNaming = projectInfo.featureNaming?.pattern
        ? projectInfo.featureNaming
        : undefined;
    const namingPatternHintId = useId();

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

    const blockedProps: TrackingProps = globalFlagLimitReached
        ? { blockedBy: 'limit', scope: 'global' }
        : projectFlagLimitReached
          ? { blockedBy: 'limit', scope: 'project' }
          : {};
    const trackCreateFlag = useTracking({
        ...createFlagTracking,
        props: { variant: 'per-flag-lifetime', ...blockedProps },
    });

    useEffect(() => {
        if (open && !loadingTotalFlagCount) {
            trackCreateFlag('opened');
        }
    }, [open, loadingTotalFlagCount, trackCreateFlag]);

    const { projects } = useProjects();

    const currentProjectName = useMemo(() => {
        const projectObject = projects.find(
            (projectOption) => projectOption.id === project,
        );
        return projectObject?.name;
    }, [project, projects]);

    const onDialogClose = (method: DialogDismissMethod) => {
        trackCreateFlag('dismissed', { method });
        setStoredFlagConfig({
            name,
            tags,
            impressionData,
            type,
            description,
            lifetime,
            lifetimeChosenByUser,
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
        <StyledDialog
            open={open}
            onClose={(_, reason) =>
                onDialogClose(dismissMethodFromCloseReason(reason))
            }
        >
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
                        onClose={() => onDialogClose('close-icon')}
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
                        <BorderlessInput
                            variant='standard'
                            placeholder={
                                projectInfo.featureNaming?.example ||
                                'Enter-flag-name'
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
                                htmlInput: {
                                    'aria-label': 'Feature flag name',
                                    'aria-required': true,
                                    ...(projectFlagNaming &&
                                        !errors.name && {
                                            'aria-describedby':
                                                namingPatternHintId,
                                        }),
                                    sx: (theme) => theme.typography.h1,
                                },
                                formHelperText: {
                                    'data-testid': INPUT_ERROR_TEXT,
                                    title: errors.name,
                                },
                            }}
                            data-testid='FORM_NAME_INPUT'
                            fullWidth
                        />
                        {projectFlagNaming ? (
                            <NamingPatternHint
                                id={namingPatternHintId}
                                naming={projectFlagNaming}
                            />
                        ) : null}
                        <BorderlessInput
                            variant='standard'
                            placeholder='Add a line about what it does (optional)'
                            multiline
                            maxRows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            slotProps={{
                                htmlInput: {
                                    'aria-label': 'Description',
                                    sx: descriptionInputStyles,
                                },
                            }}
                            data-testid='FORM_DESCRIPTION_INPUT'
                            fullWidth
                        />
                    </Fields>

                    <FlagTypeFieldset
                        type={type}
                        error={typeError}
                        onChange={selectType}
                    />

                    <LifetimeFieldset
                        lifetime={lifetime}
                        onChange={selectLifetime}
                    />

                    <OptionalSettingsFieldset
                        tags={tags}
                        onTagsChange={setTags}
                        impressionData={impressionData}
                        onImpressionDataChange={setImpressionData}
                    />

                    <BottomSection>
                        <Limit
                            name='feature flags'
                            limit={uiConfig.resourceLimits.featureFlags}
                            currentValue={totalFlags ?? 0}
                        />
                    </BottomSection>

                    <FormActions>
                        <Button onClick={() => onDialogClose('cancel-button')}>
                            Cancel
                        </Button>
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
