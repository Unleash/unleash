import { useState } from 'react';
import { Button, styled, Typography } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUiFlag } from 'hooks/useUiFlag';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { StepLayout, type StepState } from './StepLayout.tsx';
import { getOnboardingEnvironment } from './getOnboardingEnvironment.ts';

interface ITurnFlagStepProps {
    projectId: string;
    state: StepState;
    onFlagEnabled?: () => void;
}

const SwitchRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export const TurnFlagStep = ({
    projectId,
    state,
    onFlagEnabled,
}: ITurnFlagStepProps) => {
    const celebrationEnabled = useUiFlag('onboardingCelebration');
    const { features, refetch: refetchFeatures } = useFeatureSearch({
        project: `IS:${projectId}`,
    });
    const { toggleFeatureEnvironmentOn } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const [isToggling, setIsToggling] = useState(false);

    const firstFeature = features[0];
    const environment = getOnboardingEnvironment(firstFeature);
    const goToFlagHref = firstFeature
        ? `/projects/${projectId}/features/${firstFeature.name}`
        : `/projects/${projectId}`;

    const onEnableFlag = async (featureName: string, environmentId: string) => {
        setIsToggling(true);
        try {
            await toggleFeatureEnvironmentOn(
                projectId,
                featureName,
                environmentId,
                true,
            );
            setToastData({
                type: 'success',
                text: `Enabled in ${environmentId}`,
            });
            refetchFeatures();
            onFlagEnabled?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsToggling(false);
        }
    };

    const inlineToggle =
        celebrationEnabled && firstFeature && environment ? (
            <SwitchRow>
                <PermissionSwitch
                    permission={UPDATE_FEATURE_ENVIRONMENT}
                    projectId={projectId}
                    environmentId={environment.name}
                    checked={environment.enabled}
                    disabled={isToggling || environment.enabled}
                    onChange={(event) => {
                        if (event.target.checked) {
                            onEnableFlag(firstFeature.name, environment.name);
                        }
                    }}
                />
                <SwitchLabel>
                    Enable <strong>{firstFeature.name}</strong> in{' '}
                    {environment.name}
                </SwitchLabel>
            </SwitchRow>
        ) : null;

    return (
        <StepLayout
            stepNumber={3}
            state={state}
            icon={<ToggleOnIcon />}
            title='Turn flag on'
            body='Check that the flag is working by turning it on.'
        >
            {state === 'done' ? (
                <Button
                    variant='outlined'
                    color='inherit'
                    startIcon={<CheckIcon />}
                    disabled
                >
                    Done
                </Button>
            ) : state === 'active' ? (
                (inlineToggle ?? (
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        nativeButton={false}
                        to={goToFlagHref}
                    >
                        Go to flag
                    </Button>
                ))
            ) : (
                <Button variant='contained' color='primary' disabled>
                    Go to flag
                </Button>
            )}
        </StepLayout>
    );
};
