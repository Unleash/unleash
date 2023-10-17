import {
    ComponentProps,
    FC,
    ReactNode,
    useCallback,
    useMemo,
    useReducer,
    useState,
    type VFC,
} from 'react';
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
    isProdGuardEnabled,
    useFeatureStrategyProdGuard,
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
    onError?: () => void;
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

export const useFeatureToggleSwitch = () => {
    const { loading, toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    // FIXME: change modals approach
    const [prodGuardModalState, setProdGuardModalState] = useState<
        ComponentProps<typeof FeatureStrategyProdGuard>
    >({
        open: false,
        label: '',
        loading: false,
        onClose: () => {},
        onClick: () => {},
    });

    const onToggle = useCallback(
        async (newState: boolean, config: OnFeatureToggleSwitchArgs) => {
            let shouldActivateDisabled = false;

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
                            config.onError?.();
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
                shouldActivateDisabled = false;
                // TODO: implementation
                next();
            };

            const addToChangeRequest: Middleware = (next) => {
                if (!config.isChangeRequestEnabled) {
                    next();
                }
                // TODO: implementation
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
                        shouldActivateDisabled,
                    );
                    setToastData({
                        type: 'success',
                        title: `Available in ${config.environmentName}`,
                        text: `${config.featureId} is now available in ${config.environmentName} based on its defined strategies.`,
                    });
                    config.onSuccess?.();
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                    config.onError?.();
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
                    config.onError?.();
                }
            };

            return composeAndRunMiddlewares([
                confirmProductionChanges,
                addToChangeRequest,
                ensureActiveStrategies,
                handleToggleEnvironmentOff,
                handleToggleEnvironmentOn,
                () => {
                    console.log('done', { newState, config }); // FIXME: remove
                    config.onSuccess?.();
                },
            ]);
        },
        [setProdGuardModalState],
    );

    const modals = useMemo(
        () => (
            <>
                <FeatureStrategyProdGuard {...prodGuardModalState} />
            </>
        ),
        [prodGuardModalState],
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
                onError: onRollback,
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
