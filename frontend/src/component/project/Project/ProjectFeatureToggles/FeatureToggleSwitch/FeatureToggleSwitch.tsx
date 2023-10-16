import { useState, type VFC } from 'react';
import { Box, styled } from '@mui/material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate';
import { flexRow } from 'themes/themeStyles';
import { ENVIRONMENT_STRATEGY_ERROR } from 'constants/apiErrors';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestToggle } from 'hooks/useChangeRequestToggle';
import { UpdateEnabledMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/UpdateEnabledMessage';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import {
    FeatureStrategyProdGuard,
    useFeatureStrategyProdGuard,
} from 'component/feature/FeatureStrategy/FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { EnableEnvironmentDialog } from './EnableEnvironmentDialog/EnableEnvironmentDialog';

const StyledBoxContainer = styled(Box)<{ 'data-testid': string }>(() => ({
    mx: 'auto',
    ...flexRow,
}));

interface IFeatureToggleSwitchProps {
    featureId: string;
    environmentName: string;
    projectId: string;
    value: boolean;
    type: string;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
    onError?: () => void;
    onToggle?: (
        projectId: string,
        feature: string,
        env: string,
        state: boolean,
    ) => void;
}

export const FeatureToggleSwitch: VFC<IFeatureToggleSwitchProps> = ({
    projectId,
    featureId,
    environmentName,
    value,
    type,
    hasStrategies,
    hasEnabledStrategies,
    onToggle,
    onError,
}) => {
    const { loading, toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const {
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    } = useChangeRequestToggle(projectId);
    const [isChecked, setIsChecked, rollbackIsChecked] =
        useOptimisticUpdate<boolean>(value);

    const [showEnabledDialog, setShowEnabledDialog] = useState(false);
    const enableProdGuard = useFeatureStrategyProdGuard(type, environmentName);
    const [showProdGuard, setShowProdGuard] = useState(false);
    const featureHasOnlyDisabledStrategies =
        hasStrategies && !hasEnabledStrategies;

    const handleToggleEnvironmentOn = async (
        shouldActivateDisabled = false,
    ) => {
        try {
            setIsChecked(!isChecked);
            await toggleFeatureEnvironmentOn(
                projectId,
                featureId,
                environmentName,
                shouldActivateDisabled,
            );
            setToastData({
                type: 'success',
                title: `Available in ${environmentName}`,
                text: `${featureId} is now available in ${environmentName} based on its defined strategies.`,
            });
            onToggle?.(projectId, featureId, environmentName, !isChecked);
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === ENVIRONMENT_STRATEGY_ERROR
            ) {
                onError?.();
            } else {
                setToastApiError(formatUnknownError(error));
            }
            rollbackIsChecked();
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            setIsChecked(!isChecked);
            await toggleFeatureEnvironmentOff(
                projectId,
                featureId,
                environmentName,
            );
            setToastData({
                type: 'success',
                title: `Unavailable in ${environmentName}`,
                text: `${featureId} is unavailable in ${environmentName} and its strategies will no longer have any effect.`,
            });
            onToggle?.(projectId, featureId, environmentName, !isChecked);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            rollbackIsChecked();
        }
    };

    const handleClick = async () => {
        setShowProdGuard(false);
        if (isChangeRequestConfigured(environmentName)) {
            if (featureHasOnlyDisabledStrategies) {
                setShowEnabledDialog(true);
            } else {
                onChangeRequestToggle(
                    featureId,
                    environmentName,
                    !isChecked,
                    false,
                );
            }
            return;
        }
        if (isChecked) {
            await handleToggleEnvironmentOff();
            return;
        }

        if (featureHasOnlyDisabledStrategies) {
            setShowEnabledDialog(true);
        } else {
            await handleToggleEnvironmentOn();
        }
    };

    const onClick = async () => {
        if (enableProdGuard && !isChangeRequestConfigured(environmentName)) {
            setShowProdGuard(true);
        } else {
            await handleClick();
        }
    };

    const onActivateStrategies = async () => {
        if (isChangeRequestConfigured(environmentName)) {
            onChangeRequestToggle(featureId, environmentName, !isChecked, true);
        } else {
            await handleToggleEnvironmentOn(true);
        }
        setShowEnabledDialog(false);
    };

    const onAddDefaultStrategy = async () => {
        if (isChangeRequestConfigured(environmentName)) {
            onChangeRequestToggle(
                featureId,
                environmentName,
                !isChecked,
                false,
            );
        } else {
            await handleToggleEnvironmentOn();
        }
        setShowEnabledDialog(false);
    };

    const key = `${featureId}-${environmentName}`;

    return (
        <>
            <StyledBoxContainer
                key={key} // Prevent animation when archiving rows
                data-testid={`TOGGLE-${key}`}
            >
                <PermissionSwitch
                    tooltip={
                        isChecked
                            ? `Disable feature in ${environmentName}`
                            : `Enable feature in ${environmentName}`
                    }
                    checked={isChecked}
                    environmentId={environmentName}
                    projectId={projectId}
                    permission={UPDATE_FEATURE_ENVIRONMENT}
                    inputProps={{ 'aria-label': environmentName }}
                    onClick={onClick}
                    data-testid={'permission-switch'}
                />
            </StyledBoxContainer>
            <EnableEnvironmentDialog
                isOpen={showEnabledDialog}
                onClose={() => setShowEnabledDialog(false)}
                environment={environmentName}
                onActivateDisabledStrategies={onActivateStrategies}
                onAddDefaultStrategy={onAddDefaultStrategy}
            />
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
            <FeatureStrategyProdGuard
                open={showProdGuard}
                onClose={() => setShowProdGuard(false)}
                onClick={handleClick}
                loading={loading}
                label={`${isChecked ? 'Disable' : 'Enable'} Environment`}
            />
        </>
    );
};
