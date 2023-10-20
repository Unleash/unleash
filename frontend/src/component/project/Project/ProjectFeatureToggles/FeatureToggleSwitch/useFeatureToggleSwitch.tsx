import { ComponentProps, useCallback, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { useChangeRequestToggle } from 'hooks/useChangeRequestToggle';
import { UpdateEnabledMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/UpdateEnabledMessage';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import {
    FeatureStrategyProdGuard,
    isProdGuardEnabled,
} from 'component/feature/FeatureStrategy/FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { EnableEnvironmentDialog } from './EnableEnvironmentDialog/EnableEnvironmentDialog';
import {
    OnFeatureToggleSwitchArgs,
    UseFeatureToggleSwitchType,
} from './FeatureToggleSwitch.types';

export const useFeatureToggleSwitch: UseFeatureToggleSwitchType = (
    projectId: string,
) => {
    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const [prodGuardModalState, setProdGuardModalState] = useState<
        ComponentProps<typeof FeatureStrategyProdGuard>
    >({
        open: false,
        label: '',
        loading: false,
        onClose: () => {},
        onClick: () => {},
    });
    const [enableEnvironmentDialogState, setEnableEnvironmentDialogState] =
        useState<ComponentProps<typeof EnableEnvironmentDialog>>({
            isOpen: false,
            environment: '',
            onClose: () => {},
            onActivateDisabledStrategies: () => {},
            onAddDefaultStrategy: () => {},
        });
    const {
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    } = useChangeRequestToggle(projectId);
    const [changeRequestDialogCallback, setChangeRequestDialogCallback] =
        useState<() => void>();

    const onToggle = useCallback(
        async (newState: boolean, config: OnFeatureToggleSwitchArgs) => {
            let shouldActivateDisabledStrategies = false;

            const confirmProductionChanges = async () => {
                if (config.isChangeRequestEnabled) {
                    // skip if change requests are enabled
                    return;
                }

                if (!isProdGuardEnabled(config.environmentType || '')) {
                    return;
                }

                return new Promise<void>((resolve, reject) => {
                    setProdGuardModalState({
                        open: true,
                        label: `${
                            !newState ? 'Disable' : 'Enable'
                        } Environment`,
                        loading: false,
                        onClose: () => {
                            setProdGuardModalState((prev) => ({
                                ...prev,
                                open: false,
                            }));
                            config.onRollback?.();
                            reject();
                        },
                        onClick: () => {
                            setProdGuardModalState((prev) => ({
                                ...prev,
                                open: false,
                                loading: true,
                            }));
                            resolve();
                        },
                    });
                });
            };

            const ensureActiveStrategies = async () => {
                if (!config.hasStrategies || config.hasEnabledStrategies) {
                    return;
                }

                return new Promise<void>((resolve, reject) => {
                    setEnableEnvironmentDialogState({
                        isOpen: true,
                        environment: config.environmentName,
                        onClose: () => {
                            setEnableEnvironmentDialogState((prev) => ({
                                ...prev,
                                isOpen: false,
                            }));
                            config.onRollback?.();
                            reject();
                        },
                        onActivateDisabledStrategies: () => {
                            setEnableEnvironmentDialogState((prev) => ({
                                ...prev,
                                isOpen: false,
                            }));
                            shouldActivateDisabledStrategies = true;
                            resolve();
                        },
                        onAddDefaultStrategy: () => {
                            setEnableEnvironmentDialogState((prev) => ({
                                ...prev,
                                isOpen: false,
                            }));
                            resolve();
                        },
                    });
                });
            };

            const addToChangeRequest = async () => {
                if (!config.isChangeRequestEnabled) {
                    return;
                }

                return new Promise<void>((_resolve, reject) => {
                    setChangeRequestDialogCallback(() => {
                        setChangeRequestDialogCallback(undefined);
                        // always reset to previous state when using change requests
                        config.onRollback?.();
                        reject();
                    });

                    onChangeRequestToggle(
                        config.featureId,
                        config.environmentName,
                        newState,
                        shouldActivateDisabledStrategies,
                    );
                });
            };

            const handleToggleEnvironmentOn = async () => {
                if (newState !== true) {
                    return;
                }

                try {
                    await toggleFeatureEnvironmentOn(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                        shouldActivateDisabledStrategies,
                    );
                    setToastData({
                        type: 'success',
                        title: `Enabled in ${config.environmentName}`,
                        text: `${config.featureId} is now available in ${config.environmentName} based on its defined strategies.`,
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                }
            };

            const handleToggleEnvironmentOff = async () => {
                if (newState !== false) {
                    return;
                }

                try {
                    await toggleFeatureEnvironmentOff(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                    );
                    setToastData({
                        type: 'success',
                        title: `Disabled in ${config.environmentName}`,
                        text: `${config.featureId} is unavailable in ${config.environmentName} and its strategies will no longer have any effect.`,
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                }
            };

            try {
                await confirmProductionChanges();
                await ensureActiveStrategies();
                await addToChangeRequest();
                await handleToggleEnvironmentOff();
                await handleToggleEnvironmentOn();
            } catch {}
        },
        [setProdGuardModalState],
    );

    const modals = (
        <>
            <FeatureStrategyProdGuard {...prodGuardModalState} />
            <EnableEnvironmentDialog {...enableEnvironmentDialogState} />
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={() => {
                    changeRequestDialogCallback?.();
                    onChangeRequestToggleClose();
                }}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={() => {
                    changeRequestDialogCallback?.();
                    onChangeRequestToggleConfirm();
                }}
                messageComponent={
                    <UpdateEnabledMessage
                        enabled={changeRequestDialogDetails?.enabled!}
                        featureName={changeRequestDialogDetails?.featureName!}
                        environment={changeRequestDialogDetails.environment!}
                    />
                }
            />
        </>
    );

    return { onToggle, modals };
};
