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
    disabledStrategiesCount?: number;
}

export const EnableEnvironmentDialog: FC<IEnableEnvironmentDialogProps> = ({
    isOpen,
    onAddDefaultStrategy,
    onActivateDisabledStrategies,
    onClose,
    environment,
    disabledStrategiesCount,
}) => {
    const projectId = useRequiredPathParam('projectId');

    const disabledStrategiesText = disabledStrategiesCount
        ? disabledStrategiesCount === 1
            ? '1 disabled strategy'
            : `${disabledStrategiesCount} disabled strategies`
        : 'disabled strategies';

    return (
        <Dialogue
            open={isOpen}
            secondaryButtonText='Cancel'
            permissionButton={
                <>
                    <PermissionButton
                        type='button'
                        variant='outlined'
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        environmentId={environment}
                        onClick={onAddDefaultStrategy}
                    >
                        Add default strategy
                    </PermissionButton>
                    <PermissionButton
                        type='button'
                        variant='outlined'
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
            title={`Enable feature toggle in ${environment}`}
            fullWidth
        >
            <Typography
                variant='body1'
                color='text.primary'
                sx={{ mb: (theme) => theme.spacing(2) }}
            >
                To enable this feature toggle you can choose to:
            </Typography>
            <ul>
                <li>
                    <Typography>
                        <strong>Add the default strategy</strong>
                    </Typography>
                </li>
                <li>
                    <Typography>
                        <strong>Enable all the disabled strategies</strong>{' '}
                        (this feature toggle has {disabledStrategiesText})
                    </Typography>
                </li>
            </ul>
        </Dialogue>
    );
};
