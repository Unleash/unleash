import React, { useMemo } from 'react';
import { styled } from '@mui/material';
import { flexRow } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import VariantsWarningTooltip from 'component/feature/FeatureView/FeatureVariants/VariantsTooltipWarning';
import { FeatureToggleSwitch } from './FeatureToggleSwitch.tsx';
import type { UseFeatureToggleSwitchType } from './FeatureToggleSwitch.types';
import type { ListItemType } from '../../PaginatedProjectFeatureToggles/ProjectFeatureToggles.types';

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

interface IFeatureToggleCellProps {
    projectId: string;
    environmentName: string;
    isChangeRequestEnabled: boolean;
    refetch: () => void;
    onFeatureToggleSwitch: ReturnType<UseFeatureToggleSwitchType>['onToggle'];
    value: boolean;
    feature: ListItemType;
}

const FeatureToggleCellComponent = ({
    value,
    feature,
    projectId,
    environmentName,
    isChangeRequestEnabled,
    refetch,
    onFeatureToggleSwitch,
}: IFeatureToggleCellProps) => {
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
            hasReleasePlans: environment?.hasReleasePlans,
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

const MemoizedFeatureToggleCell = React.memo(FeatureToggleCellComponent);

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
        return (
            <MemoizedFeatureToggleCell
                value={value}
                feature={feature}
                projectId={projectId}
                environmentName={environmentName}
                isChangeRequestEnabled={isChangeRequestEnabled}
                refetch={refetch}
                onFeatureToggleSwitch={onFeatureToggleSwitch}
            />
        );
    };
