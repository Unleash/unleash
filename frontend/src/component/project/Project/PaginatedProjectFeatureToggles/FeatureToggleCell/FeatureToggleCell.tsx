import React, { useMemo } from 'react';
import { styled } from '@mui/material';
import { flexRow } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import VariantsWarningTooltip from 'component/feature/FeatureView/FeatureVariants/VariantsTooltipWarning';
import { FeatureToggleSwitch } from '../../ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch.tsx';
import type { UseFeatureToggleSwitchType } from '../../ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch.types';
import type { FeatureEnvironmentSchema } from 'openapi';

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

const StyledDiv = styled('div')(({ theme }) => ({
    flexGrow: 0,
    ...flexRow,
    justifyContent: 'center',
}));

interface IFeatureToggleCellProps {
    projectId: string;
    environmentName: string;
    isChangeRequestEnabled: boolean;
    refetch: () => void;
    onFeatureToggleSwitch: ReturnType<UseFeatureToggleSwitchType>['onToggle'];
    value: boolean;
    featureId: string;
    environment?: FeatureEnvironmentSchema;
    someEnabledEnvironmentHasVariants?: boolean;
}

const FeatureToggleCellComponent = ({
    value,
    featureId,
    projectId,
    environment,
    isChangeRequestEnabled,
    someEnabledEnvironmentHasVariants,
    refetch,
    onFeatureToggleSwitch,
}: IFeatureToggleCellProps) => {
    const hasWarning = useMemo(
        () =>
            someEnabledEnvironmentHasVariants &&
            environment?.variantCount === 0 &&
            environment?.enabled,
        [someEnabledEnvironmentHasVariants, environment],
    );

    const onToggle = (newState: boolean, onRollback: () => void) => {
        onFeatureToggleSwitch(newState, {
            projectId,
            featureId,
            environmentName: environment?.name || '',
            environmentType: environment?.type,
            hasStrategies: environment?.hasStrategies,
            hasReleasePlans: Boolean(environment?.releasePlans?.length),
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
                featureId={featureId}
                environmentName={environment?.name || ''}
                onToggle={onToggle}
            />
            <ConditionallyRender
                condition={hasWarning || false}
                show={<VariantsWarningTooltip />}
            />
        </StyledSwitchContainer>
    );
};

export const FeatureToggleCell = React.memo(FeatureToggleCellComponent);

export const PlaceholderFeatureToggleCell = () => (
    <StyledSwitchContainer>
        <div data-loading>toggle</div>
    </StyledSwitchContainer>
);
export const ArchivedFeatureToggleCell = () => (
    <StyledDiv aria-hidden='true'>-</StyledDiv>
);
