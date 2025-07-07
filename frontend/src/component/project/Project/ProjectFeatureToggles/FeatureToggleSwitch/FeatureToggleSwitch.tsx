import type { VFC } from 'react';
import { Box, styled } from '@mui/material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate.ts';
import { flexRow } from 'themes/themeStyles';

const StyledBoxContainer = styled(Box)<{ 'data-testid': string }>(() => ({
    mx: 'auto',
    ...flexRow,
}));

type FeatureToggleSwitchProps = {
    featureId: string;
    projectId: string;
    environmentName: string;
    value: boolean;
    onToggle: (newState: boolean, onRollback: () => void) => void;
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
                            ? `Disable flag in ${environmentName}`
                            : `Enable flag in ${environmentName}`
                    }
                    checked={value}
                    environmentId={environmentName}
                    projectId={projectId}
                    permission={UPDATE_FEATURE_ENVIRONMENT}
                    inputProps={{ 'aria-label': environmentName }}
                    onClick={onClick}
                    data-testid={'permission-switch'}
                    disabled={value !== isChecked}
                />
            </StyledBoxContainer>
        </>
    );
};
