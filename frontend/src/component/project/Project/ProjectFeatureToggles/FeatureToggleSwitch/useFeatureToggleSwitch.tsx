import { type ComponentProps, useCallback, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useTracking } from 'hooks/useTracking';
import useToast from 'hooks/useToast';
import { useChangeRequestToggle } from 'hooks/useChangeRequestToggle';
import { UpdateEnabledMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/UpdateEnabledMessage';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import {
    FeatureStrategyProdGuard,
    isProdGuardEnabled,
} from 'component/feature/FeatureStrategy/FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { EnableEnvironmentDialog } from './EnableEnvironmentDialog/EnableEnvironmentDialog.tsx';
import {
    enableStrategiesDialogTracking,
    environmentToggleTracking,
    prodGuardDialogTracking,
} from './environmentToggleTracking';
import type {
    OnFeatureToggleSwitchArgs,
    UseFeatureToggleSwitchType,
} from './FeatureToggleSwitch.types';
import type { TrackingProps } from 'utils/trackingEvents';
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
    const trackEnvironmentToggle = useTracking(environmentToggleTracking);
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
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    } = useChangeRequestToggle(projectId);
    const [changeRequestDialogCallback, setChangeRequestDialogCallback] =
        useState<() => void>();
    // The change request dialog runs the request itself, so it carries the flip's props.
    const [changeRequestTrackingProps, setChangeRequestTrackingProps] =
        useState<TrackingProps>();

    const onToggle = useCallback(
        async (newState: boolean, config: OnFeatureToggleSwitchArgs) => {
            let shouldActivateDisabledStrategies = false;
            const trackingProps = {
                newState: newState ? 'enabled' : 'disabled',
                environmentType: config.environmentType || 'unknown',
                viaChangeRequest: Boolean(config.isChangeRequestEnabled),
                hasStrategies: Boolean(config.hasStrategies),
            };
            // Only known once the enable-strategies gate has run.
            const mutationProps = () => ({
                ...trackingProps,
                activatedDisabledStrategies: shouldActivateDisabledStrategies,
            });

            const confirmProductionChanges: Middleware = (next) => {
                if (config.isChangeRequestEnabled) {
                    // skip if change requests are enabled
                    return next();
                }

                if (!isProdGuardEnabled(config.environmentType || '')) {
                    return next();
                }

                setProdGuardModalState({
                    open: true,
                    label: `${!newState ? 'Disable' : 'Enable'} Environment`,
                    loading: false,
                    tracking: {
                        ...prodGuardDialogTracking,
                        props: trackingProps,
                    },
                    onClose: () => {
                        setProdGuardModalState((prev) => ({
                            ...prev,
                            open: false,
                        }));
                        config.onRollback?.();
                    },
                    onClick: () => {
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

                setEnableEnvironmentDialogState({
                    isOpen: true,
                    environment: config.environmentName,
                    featureId: config.featureId,
                    tracking: {
                        ...enableStrategiesDialogTracking,
                        props: trackingProps,
                    },
                    onClose: () => {
                        setEnableEnvironmentDialogState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                        config.onRollback?.();
                    },
                    onActivateDisabledStrategies: () => {
                        setEnableEnvironmentDialogState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                        shouldActivateDisabledStrategies = true;
                        next();
                    },
                    onAddDefaultStrategy: () => {
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

                setChangeRequestTrackingProps(mutationProps());
                onChangeRequestToggle(
                    config.featureId,
                    config.environmentName,
                    newState,
                    shouldActivateDisabledStrategies,
                );
            };

            const handleToggleEnvironmentOn: Middleware = async (next) => {
                if (newState !== true) {
                    return next();
                }

                try {
                    await trackEnvironmentToggle.mutation(
                        () =>
                            toggleFeatureEnvironmentOn(
                                config.projectId,
                                config.featureId,
                                config.environmentName,
                                shouldActivateDisabledStrategies,
                            ),
                        mutationProps(),
                    );

                    setToastData({
                        type: 'success',
                        text: `Enabled in ${config.environmentName}`,
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                    config.onRollback?.();
                }
            };

            const handleToggleEnvironmentOff: Middleware = async (next) => {
                if (newState !== false) {
                    return next();
                }

                try {
                    await trackEnvironmentToggle.mutation(
                        () =>
                            toggleFeatureEnvironmentOff(
                                config.projectId,
                                config.featureId,
                                config.environmentName,
                            ),
                        mutationProps(),
                    );
                    setToastData({
                        type: 'success',
                        text: `Disabled in ${config.environmentName}`,
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
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
        [setProdGuardModalState, trackEnvironmentToggle],
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
                    ...environmentToggleTracking,
                    props: changeRequestTrackingProps,
                }}
                onClose={() => {
                    changeRequestDialogCallback?.();
                    onChangeRequestToggleClose();
                }}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={() => {
                    changeRequestDialogCallback?.();
                    return onChangeRequestToggleConfirm();
                }}
                onError={(error) => setToastApiError(formatUnknownError(error))}
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
