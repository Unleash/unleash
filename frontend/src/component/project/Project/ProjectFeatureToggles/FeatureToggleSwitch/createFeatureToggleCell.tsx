import { useMemo } from 'react';
import { styled } from '@mui/material';
import { flexRow } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import VariantsWarningTooltip from 'component/feature/FeatureView/FeatureVariants/VariantsTooltipWarning';
import { FeatureToggleSwitch } from './NewFeatureToggleSwitch';
import type { ListItemType } from '../ProjectFeatureToggles.types';
import type { UseFeatureToggleSwitchType } from './NewFeatureToggleSwitch.types';

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
        onFeatureToggleSwitch: ReturnType<UseFeatureToggleSwitchType>['onToggle'],
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
