import { type ComponentProps, useCallback, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useEventTracker } from 'hooks/useEventTracker';
import useToast from 'hooks/useToast';
import { useChangeRequestToggle } from 'hooks/useChangeRequestToggle';
import { UpdateEnabledMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/UpdateEnabledMessage';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import {
    FeatureStrategyProdGuard,
    isProdGuardEnabled,
} from 'component/feature/FeatureStrategy/FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { EnableEnvironmentDialog } from './EnableEnvironmentDialog/EnableEnvironmentDialog.tsx';
import type {
    OnFeatureToggleSwitchArgs,
    UseFeatureToggleSwitchType,
} from './FeatureToggleSwitch.types';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

type Middleware = (next: () => void) => void;

const composeAndRunMiddlewares = (middlewares: Middleware[]) => {
    const runMiddleware = (currentIndex: number) => {
        if (currentIndex < middlewares.length) {
            middlewares[currentIndex](() => runMiddleware(currentIndex + 1));
        }
    };

    runMiddleware(0);
};

export const useFeatureToggleSwitch: UseFeatureToggleSwitchType = (
    projectId: string,
) => {
    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = useEventTracker();
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
            featureId: '',
            onClose: () => {},
            onActivateDisabledStrategies: () => {},
            onAddDefaultStrategy: () => {},
        });
    const {
        pending,
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
            let prodGuardShown = false;
            let strategiesDialogShown = false;
            const environmentType = config.environmentType || 'unknown';
            const eventType = newState ? 'enabled' : 'disabled';
            const viaChangeRequest = Boolean(config.isChangeRequestEnabled);

            trackEvent('flag-environment-toggled', {
                props: {
                    eventType,
                    environmentType,
                    viaChangeRequest,
                    hasStrategies: Boolean(config.hasStrategies),
                    action: 'toggled',
                },
            });

            const trackDialogSubmitted = () => {
                trackEvent('flag-environment-toggled', {
                    props: {
                        eventType,
                        environmentType,
                        viaChangeRequest,
                        action: 'submitted',
                    },
                });
            };

            const confirmProductionChanges: Middleware = (next) => {
                if (config.isChangeRequestEnabled) {
                    // skip if change requests are enabled
                    return next();
                }

                if (!isProdGuardEnabled(config.environmentType || '')) {
                    return next();
                }

                prodGuardShown = true;
                setProdGuardModalState({
                    open: true,
                    label: `${!newState ? 'Disable' : 'Enable'} Environment`,
                    loading: false,
                    tracking: {
                        event: 'flag-environment-toggled',
                        type: eventType,
                    },
                    onClose: () => {
                        setProdGuardModalState((prev) => ({
                            ...prev,
                            open: false,
                        }));
                        config.onRollback?.();
                    },
                    onClick: () => {
                        trackDialogSubmitted();
                        setProdGuardModalState((prev) => ({
                            ...prev,
                            open: false,
                            loading: true,
                        }));
                        next();
                    },
                });
            };

            const ensureActiveStrategies: Middleware = (next) => {
                if (
                    newState === false ||
                    !config.hasStrategies ||
                    config.hasEnabledStrategies ||
                    config.hasReleasePlans
                ) {
                    return next();
                }

                strategiesDialogShown = true;
                setEnableEnvironmentDialogState({
                    isOpen: true,
                    environment: config.environmentName,
                    featureId: config.featureId,
                    tracking: {
                        event: 'flag-environment-toggled',
                        type: eventType,
                    },
                    onClose: () => {
                        setEnableEnvironmentDialogState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                        config.onRollback?.();
                    },
                    onActivateDisabledStrategies: () => {
                        trackDialogSubmitted();
                        setEnableEnvironmentDialogState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                        shouldActivateDisabledStrategies = true;
                        next();
                    },
                    onAddDefaultStrategy: () => {
                        trackDialogSubmitted();
                        setEnableEnvironmentDialogState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                        next();
                    },
                });
            };

            const addToChangeRequest: Middleware = (next) => {
                if (!config.isChangeRequestEnabled) {
                    return next();
                }

                setChangeRequestDialogCallback(() => {
                    setChangeRequestDialogCallback(undefined);
                    // always reset to previous state when using change requests
                    config.onRollback?.();
                });

                const trackingProps = {
                    eventType,
                    environmentType,
                    viaChangeRequest,
                    strategiesDialogShown,
                };

                onChangeRequestToggle(
                    config.featureId,
                    config.environmentName,
                    newState,
                    shouldActivateDisabledStrategies,
                    {
                        onConfirm: () => {
                            trackEvent('flag-environment-toggled', {
                                props: {
                                    ...trackingProps,
                                    action: 'submitted',
                                },
                            });
                        },
                        onSuccess: () => {
                            trackEvent('flag-environment-toggled', {
                                props: {
                                    ...trackingProps,
                                    action: 'succeeded',
                                },
                            });
                        },
                        onFailure: () => {
                            trackEvent('flag-environment-toggled', {
                                props: { ...trackingProps, action: 'failed' },
                            });
                        },
                    },
                );
            };

            const handleToggleEnvironmentOn: Middleware = async (next) => {
                if (newState !== true) {
                    return next();
                }

                const trackingProps = {
                    eventType,
                    environmentType,
                    viaChangeRequest,
                    hasStrategies: Boolean(config.hasStrategies),
                    prodGuardShown,
                    strategiesDialogShown,
                };

                try {
                    await toggleFeatureEnvironmentOn(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                        shouldActivateDisabledStrategies,
                    );

                    setToastData({
                        type: 'success',
                        text: `Enabled in ${config.environmentName}`,
                    });
                    trackEvent('flag-environment-toggled', {
                        props: { ...trackingProps, action: 'succeeded' },
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                    trackEvent('flag-environment-toggled', {
                        props: { ...trackingProps, action: 'failed' },
                    });
                    config.onRollback?.();
                }
            };

            const handleToggleEnvironmentOff: Middleware = async (next) => {
                if (newState !== false) {
                    return next();
                }

                const trackingProps = {
                    eventType,
                    environmentType,
                    prodGuardShown,
                };

                try {
                    await toggleFeatureEnvironmentOff(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                    );
                    setToastData({
                        type: 'success',
                        text: `Disabled in ${config.environmentName}`,
                    });
                    trackEvent('flag-environment-toggled', {
                        props: { ...trackingProps, action: 'succeeded' },
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                    trackEvent('flag-environment-toggled', {
                        props: { ...trackingProps, action: 'failed' },
                    });
                    config.onRollback?.();
                }
            };

            return composeAndRunMiddlewares([
                confirmProductionChanges,
                ensureActiveStrategies,
                addToChangeRequest,
                handleToggleEnvironmentOff,
                handleToggleEnvironmentOn,
            ]);
        },
        [setProdGuardModalState, trackEvent],
    );

    const featureSelected = enableEnvironmentDialogState.featureId.length !== 0;

    const modals = (
        <>
            <FeatureStrategyProdGuard {...prodGuardModalState} />
            <ConditionallyRender
                condition={featureSelected}
                show={
                    <EnableEnvironmentDialog
                        {...enableEnvironmentDialogState}
                    />
                }
            />
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                tracking={{
                    event: 'flag-environment-toggled',
                    type: changeRequestDialogDetails.enabled
                        ? 'enabled'
                        : 'disabled',
                }}
                onClose={() => {
                    changeRequestDialogCallback?.();
                    onChangeRequestToggleClose();
                }}
                environment={changeRequestDialogDetails?.environment}
                disabled={pending}
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

    return {
        onToggle,
        modals,
    };
};
