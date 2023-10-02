import { FC } from 'react';
import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';

interface IEnableEnvironmentDialogProps {
    isOpen: boolean;
    onActivateDisabledStrategies: () => void;
    onAddDefaultStrategy: () => void;
    onClose: () => void;
    environment?: string;
    showBanner?: boolean;
    disabledStrategiesCount: number;
}

export const EnableEnvironmentDialog: FC<IEnableEnvironmentDialogProps> = ({
    isOpen,
    onAddDefaultStrategy,
    onActivateDisabledStrategies,
    onClose,
    environment,
    disabledStrategiesCount = 0,
}) => {
    const projectId = useRequiredPathParam('projectId');

    return (
        <Dialogue
            open={isOpen}
            secondaryButtonText="Cancel"
            permissionButton={
                <>
                    <PermissionButton
                        type="button"
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        environmentId={environment}
                        onClick={onAddDefaultStrategy}
                    >
                        Add default strategy
                    </PermissionButton>
                    <PermissionButton
                        type="button"
                        variant={'text'}
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        environmentId={environment}
                        onClick={onActivateDisabledStrategies}
                    >
                        Enable all strategies
                    </PermissionButton>
                </>
            }
            onClose={onClose}
            title="Enable feature toggle"
            fullWidth
        >
            <Typography
                variant="body1"
                color="text.primary"
                sx={{ mb: theme => theme.spacing(2) }}
            >
                The feature toggle has {disabledStrategiesCount} disabled
                {disabledStrategiesCount === 1 ? ' strategy' : ' strategies'}.
            </Typography>
            <Typography variant="body1" color="text.primary">
                You can choose to enable all the disabled strategies or you can
                add the default strategy to enable this feature toggle.
            </Typography>
        </Dialogue>
    );
};
