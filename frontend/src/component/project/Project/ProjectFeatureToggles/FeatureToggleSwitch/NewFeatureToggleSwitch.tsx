import {
    ComponentProps,
    useCallback,
    useMemo,
    useState,
    type VFC,
} from 'react';
import { Box, styled } from '@mui/material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate';
import { flexRow } from 'themes/themeStyles';
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
import { ListItemType } from '../ProjectFeatureToggles.types';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import VariantsWarningTooltip from 'component/feature/FeatureView/FeatureVariants/VariantsTooltipWarning';

const StyledBoxContainer = styled(Box)<{ 'data-testid': string }>(() => ({
    mx: 'auto',
    ...flexRow,
}));

type OnFeatureToggleSwitchArgs = {
    featureId: string;
    projectId: string;
    environmentName: string;
    environmentType?: string;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
    isChangeRequestEnabled?: boolean;
    changeRequestToggle?: ReturnType<typeof useChangeRequestToggle>;
    onRollback?: () => void;
    onSuccess?: () => void;
};

type FeatureToggleSwitchProps = {
    featureId: string;
    projectId: string;
    environmentName: string;
    value: boolean;
    onToggle: (newState: boolean, onRollback: () => void) => void;
};

type Middleware = (next: () => void) => void;

const composeAndRunMiddlewares = (middlewares: Middleware[]) => {
    const runMiddleware = (currentIndex: number) => {
        if (currentIndex < middlewares.length) {
            middlewares[currentIndex](() => runMiddleware(currentIndex + 1));
        }
    };

    runMiddleware(0);
};

export const useFeatureToggleSwitch = (projectId: string) => {
    const { loading, toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
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

            const confirmProductionChanges: Middleware = (next) => {
                if (config.isChangeRequestEnabled) {
                    // skip if change requests are enabled
                    return next();
                }

                if (isProdGuardEnabled(config.environmentType || '')) {
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
                }

                return next();
            };

            const ensureActiveStrategies: Middleware = (next) => {
                if (!config.hasStrategies || config.hasEnabledStrategies) {
                    return next();
                }

                setEnableEnvironmentDialogState({
                    isOpen: true,
                    environment: config.environmentName,
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
                    await toggleFeatureEnvironmentOn(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                        shouldActivateDisabledStrategies,
                    );
                    setToastData({
                        type: 'success',
                        title: `Available in ${config.environmentName}`,
                        text: `${config.featureId} is now available in ${config.environmentName} based on its defined strategies.`,
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
                    await toggleFeatureEnvironmentOff(
                        config.projectId,
                        config.featureId,
                        config.environmentName,
                    );
                    setToastData({
                        type: 'success',
                        title: `Unavailable in ${config.environmentName}`,
                        text: `${config.featureId} is unavailable in ${config.environmentName} and its strategies will no longer have any effect.`,
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

export const FeatureToggleSwitch: VFC<FeatureToggleSwitchProps> = ({
    projectId,
    featureId,
    environmentName,
    value,
    onToggle,
}) => {
    const [isChecked, setIsChecked, rollbackIsChecked] =
        useOptimisticUpdate<boolean>(value);

    const onClick = () => {
        setIsChecked(!isChecked);
        requestAnimationFrame(() => {
            onToggle(!isChecked, rollbackIsChecked);
        });
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
                    disableRipple
                    disabled={value !== isChecked}
                />
            </StyledBoxContainer>
        </>
    );
};

const StyledSwitchContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasWarning',
})<{ hasWarning?: boolean }>(({ theme, hasWarning }) => ({
    flexGrow: 0,
    ...flexRow,
    justifyContent: 'center',
    ...(hasWarning && {
        '::before': {
            content: '""',
            display: 'block',
            width: theme.spacing(2),
        },
    }),
}));

export const createFeatureToggleCell =
    (
        projectId: string,
        environmentName: string,
        isChangeRequestEnabled: boolean,
        refetch: () => void,
        onFeatureToggleSwitch: ReturnType<
            typeof useFeatureToggleSwitch
        >['onToggle'],
    ) =>
    ({
        value,
        row: { original: feature },
    }: {
        value: boolean;
        row: { original: ListItemType };
    }) => {
        const environment = feature.environments[environmentName];

        const hasWarning = useMemo(
            () =>
                feature.someEnabledEnvironmentHasVariants &&
                environment.variantCount === 0 &&
                environment.enabled,
            [feature, environment],
        );

        const onToggle = (newState: boolean, onRollback: () => void) => {
            onFeatureToggleSwitch(newState, {
                projectId,
                featureId: feature.name,
                environmentName,
                environmentType: environment?.type,
                hasStrategies: environment?.hasStrategies,
                hasEnabledStrategies: environment?.hasEnabledStrategies,
                isChangeRequestEnabled,
                onRollback,
                onSuccess: refetch,
            });
        };

        return (
            <StyledSwitchContainer hasWarning={hasWarning}>
                <FeatureToggleSwitch
                    projectId={projectId}
                    value={value}
                    featureId={feature.name}
                    environmentName={environmentName}
                    onToggle={onToggle}
                />
                <ConditionallyRender
                    condition={hasWarning}
                    show={<VariantsWarningTooltip />}
                />
            </StyledSwitchContainer>
        );
    };
