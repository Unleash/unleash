import { VFC } from 'react';
import { Box } from '@mui/material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate';
import { useStyles } from './FeatureToggleSwitch.styles';

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
    const { classes } = useStyles();
    const [isChecked, setIsChecked, rollbackIsChecked] =
        useOptimisticUpdate<boolean>(value);

    const onClick = () => {
        setIsChecked(!isChecked);
        onToggle(projectId, featureName, environmentName, !isChecked).catch(
            rollbackIsChecked
        );
    };

    return (
        <Box
            className={classes.container}
            key={`${featureName}-${environmentName}`} // Prevent animation when archiving rows
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
        </Box>
    );
};
