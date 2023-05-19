import { VFC } from 'react';
import { Box, styled } from '@mui/material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate';
import { flexRow } from 'themes/themeStyles';

const StyledBoxContainer = styled(Box)<{ 'data-testid': string }>(() => ({
    mx: 'auto',
    ...flexRow,
}));

interface IFeatureToggleSwitchProps {
    featureName: string;
    environmentName: string;
    projectId: string;
    value: boolean;
    onToggle: (
        projectId: string,
        feature: string,
        env: string,
        state: boolean
    ) => Promise<void>;
}

export const FeatureToggleSwitch: VFC<IFeatureToggleSwitchProps> = ({
    projectId,
    featureName,
    environmentName,
    value,
    onToggle,
}) => {
    const [isChecked, setIsChecked, rollbackIsChecked] =
        useOptimisticUpdate<boolean>(value);

    const onClick = () => {
        setIsChecked(!isChecked);
        onToggle(projectId, featureName, environmentName, !isChecked).catch(
            rollbackIsChecked
        );
    };

    const key = `${featureName}-${environmentName}`;

    return (
        <StyledBoxContainer
            key={key} // Prevent animation when archiving rows
            data-testid={`TOGGLE-${key}`}
        >
            <PermissionSwitch
                checked={value}
                environmentId={environmentName}
                projectId={projectId}
                permission={UPDATE_FEATURE_ENVIRONMENT}
                inputProps={{ 'aria-label': environmentName }}
                onClick={onClick}
                disabled={isChecked !== value}
            />
        </StyledBoxContainer>
    );
};
