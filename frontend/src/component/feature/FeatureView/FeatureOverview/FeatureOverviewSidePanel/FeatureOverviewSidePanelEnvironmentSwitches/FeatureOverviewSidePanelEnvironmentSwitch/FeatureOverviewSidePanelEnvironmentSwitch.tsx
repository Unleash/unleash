import { ENVIRONMENT_STRATEGY_ERROR } from 'constants/apiErrors';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestToggle } from 'hooks/useChangeRequestToggle';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import { UpdateEnabledMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/UpdateEnabledMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { styled } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

const StyledContainer = styled('div')(({ theme }) => ({
    '&:not(:last-of-type)': {
        marginBottom: theme.spacing(2),
    },
}));

const StyledLabel = styled('label')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
}));

interface IFeatureOverviewSidePanelEnvironmentSwitchProps {
    env: IFeatureEnvironment;
    callback?: () => void;
    showInfoBox: () => void;
    children?: React.ReactNode;
}

export const FeatureOverviewSidePanelEnvironmentSwitch = ({
    env,
    callback,
    showInfoBox,
    children,
}: IFeatureOverviewSidePanelEnvironmentSwitchProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const {
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    } = useChangeRequestToggle(projectId);

    const handleToggleEnvironmentOn = async () => {
        try {
            await toggleFeatureEnvironmentOn(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                title: `Available in ${env.name}`,
                text: `${featureId} is now available in ${env.name} based on its defined strategies.`,
            });
            refetchFeature();
            if (callback) {
                callback();
            }
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === ENVIRONMENT_STRATEGY_ERROR
            ) {
                showInfoBox();
            } else {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            await toggleFeatureEnvironmentOff(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                title: `Unavailable in ${env.name}`,
                text: `${featureId} is unavailable in ${env.name} and its strategies will no longer have any effect.`,
            });
            refetchFeature();
            if (callback) {
                callback();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const toggleEnvironment = async (e: React.ChangeEvent) => {
        if (isChangeRequestConfigured(env.name)) {
            e.preventDefault();
            onChangeRequestToggle(featureId, env.name, !env.enabled);
            return;
        }
        if (env.enabled) {
            await handleToggleEnvironmentOff();
            return;
        }
        await handleToggleEnvironmentOn();
    };

    const defaultContent = (
        <>
            {' '}
            <span data-loading>{env.enabled ? 'enabled' : 'disabled'} in</span>
            &nbsp;
            <StringTruncator text={env.name} maxWidth="120" maxLength={15} />
        </>
    );

    return (
        <StyledContainer>
            <StyledLabel>
                <PermissionSwitch
                    permission={UPDATE_FEATURE_ENVIRONMENT}
                    projectId={projectId}
                    checked={env.enabled}
                    onChange={toggleEnvironment}
                    environmentId={env.name}
                />
                {children ?? defaultContent}
            </StyledLabel>
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={onChangeRequestToggleClose}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={onChangeRequestToggleConfirm}
                messageComponent={
                    <UpdateEnabledMessage
                        enabled={changeRequestDialogDetails?.enabled!}
                        featureName={changeRequestDialogDetails?.featureName!}
                        environment={changeRequestDialogDetails.environment!}
                    />
                }
            />
        </StyledContainer>
    );
};
