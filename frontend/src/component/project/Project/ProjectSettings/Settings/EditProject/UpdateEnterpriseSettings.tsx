import React, { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectEnterpriseSettingsForm from 'component/project/Project/hooks/useProjectEnterpriseSettingsForm';
import useProject from 'hooks/api/getters/useProject/useProject';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import ProjectEnterpriseSettingsForm from 'component/project/Project/ProjectEnterpriseSettingsForm/ProjectEnterpriseSettingsForm';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { IProject } from 'component/../interfaces/project';
import { styled } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledContainer = styled('div')(({ theme }) => ({
    minHeight: 0,
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    width: '100%',
    display: 'flex',
    margin: '0 auto',
    overflow: 'hidden',
    [theme.breakpoints.down(1100)]: {
        flexDirection: 'column',
        minHeight: 0,
    },
}));

const StyledFormContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(4),
}));

interface IUpdateEnterpriseSettings {
    project: IProject;
}
const EDIT_PROJECT_SETTINGS_BTN = 'EDIT_PROJECT_SETTINGS_BTN';

export const useModeTracking = () => {
    const [previousMode, setPreviousMode] = React.useState<string>('');
    const { trackEvent } = usePlausibleTracker();
    const eventName = 'project-mode' as const;

    const trackModePattern = (newMode: string) => {
        if (newMode !== previousMode) {
            trackEvent(eventName, {
                props: { mode: newMode, action: 'updated' },
            });
        }
    };

    return { trackModePattern, setPreviousMode };
};

export const UpdateEnterpriseSettings = ({
    project,
}: IUpdateEnterpriseSettings) => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const id = useRequiredPathParam('projectId');

    const {
        projectMode,
        featureNamingExample,
        featureNamingDescription,
        featureNamingPattern,
        setFeatureNamingPattern,
        setFeatureNamingExample,
        setFeatureNamingDescription,
        setProjectMode,
        getEnterpriseSettingsPayload,
        errors: settingsErrors = {},
        clearErrors: clearSettingsErrors,
    } = useProjectEnterpriseSettingsForm(
        project.mode,
        project?.featureNaming?.pattern,
        project?.featureNaming?.example,
        project?.featureNaming?.description,
    );

    const formatProjectSettingsApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/projects/${id}/settings' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getEnterpriseSettingsPayload(), undefined, 2)}'`;
    };

    const { refetch } = useProject(id);
    const { editProjectSettings, loading } = useProjectApi();

    const useFeatureNamePatternTracking = () => {
        const [previousPattern, setPreviousPattern] =
            React.useState<string>('');
        const { trackEvent } = usePlausibleTracker();
        const eventName = 'feature-naming-pattern' as const;

        const trackPattern = (newPattern: string = '') => {
            if (newPattern === previousPattern) {
                // do nothing; they've probably updated something else in the
                // project.
            } else if (newPattern === '' && previousPattern !== '') {
                trackEvent(eventName, { props: { action: 'removed' } });
            } else if (newPattern !== '' && previousPattern === '') {
                trackEvent(eventName, { props: { action: 'added' } });
            } else if (newPattern !== '' && previousPattern !== '') {
                trackEvent(eventName, { props: { action: 'edited' } });
            }
        };

        return { trackPattern, setPreviousPattern };
    };

    const { setPreviousPattern, trackPattern } =
        useFeatureNamePatternTracking();

    const { setPreviousMode, trackModePattern } = useModeTracking();

    const handleEditProjectSettings = async (e: Event) => {
        e.preventDefault();
        const payload = getEnterpriseSettingsPayload();
        try {
            await editProjectSettings(id, payload);
            refetch();
            setToastData({
                title: 'Project information updated',
                type: 'success',
            });
            trackPattern(featureNamingPattern);
            trackModePattern(projectMode);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    useEffect(() => {
        setPreviousPattern(featureNamingPattern || '');
        setPreviousMode(projectMode);
    }, [project]);

    return (
        <StyledContainer>
            <FormTemplate
                loading={loading}
                title='Enterprise Settings'
                description=''
                documentationLink='https://docs.getunleash.io/reference/projects'
                documentationLinkLabel='Projects documentation'
                formatApiCode={formatProjectSettingsApiCode}
                compactPadding
                showDescription={false}
                showLink={false}
            >
                <StyledFormContainer>
                    <ProjectEnterpriseSettingsForm
                        projectId={id}
                        projectMode={projectMode}
                        featureNamingPattern={featureNamingPattern}
                        featureNamingExample={featureNamingExample}
                        featureNamingDescription={featureNamingDescription}
                        setFeatureNamingPattern={setFeatureNamingPattern}
                        setFeatureNamingExample={setFeatureNamingExample}
                        setFeatureNamingDescription={
                            setFeatureNamingDescription
                        }
                        setProjectMode={setProjectMode}
                        handleSubmit={handleEditProjectSettings}
                        errors={settingsErrors}
                        clearErrors={clearSettingsErrors}
                    >
                        <PermissionButton
                            type='submit'
                            permission={UPDATE_PROJECT}
                            projectId={id}
                            data-testid={EDIT_PROJECT_SETTINGS_BTN}
                        >
                            Save changes
                        </PermissionButton>
                    </ProjectEnterpriseSettingsForm>
                </StyledFormContainer>
            </FormTemplate>
        </StyledContainer>
    );
};
