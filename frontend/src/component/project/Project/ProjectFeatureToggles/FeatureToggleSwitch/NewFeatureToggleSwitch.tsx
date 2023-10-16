import { ReactNode, useCallback, useMemo, useState, type VFC } from 'react';
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
import useProject from 'hooks/api/getters/useProject/useProject';

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
    // FIXME: change modals approach
    const [modals, setModals] = useState<ReactNode>(null);

    const onToggle = useCallback(
        async (newState: boolean, config: OnFeatureToggleSwitchArgs) => {
            const confirmProductionChanges: Middleware = (next) => {
                if (config.isChangeRequestEnabled) {
                    // skip if change requests are enabled
                    return next();
                }

                if (isProdGuardEnabled(config.environmentType || '')) {
                    return setModals(
                        <FeatureStrategyProdGuard
                            open
                            onClose={() => {
                                setModals(null);
                                config.onError?.();
                            }}
                            onClick={() => {
                                setModals(null);
                                next();
                            }}
                            // FIXME: internalize loading
                            loading={loading}
                            label={`${
                                !newState ? 'Disable' : 'Enable'
                            } Environment`}
                        />,
                    );
                }

                return next();
            };

            const addToChangeRequest: Middleware = (next) => {
                next();
            };

            const ensureActiveStrategies: Middleware = (next) => {
                next();
            };

            return composeAndRunMiddlewares([
                confirmProductionChanges,
                addToChangeRequest,
                ensureActiveStrategies,
                () => {
                    // FIXME: remove
                    console.log('done', { newState, config });
                    config.onSuccess?.();
                },
                // TODO: make actual changes
            ]);
        },
        [],
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
