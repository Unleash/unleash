import type { FC } from 'react';
import { Typography, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

const StyledList = styled('ul')(({ theme }) => ({
    margin: theme.spacing(1),
    paddingLeft: theme.spacing(2),
}));

interface IEnableEnvironmentDialogProps {
    isOpen: boolean;
    onActivateDisabledStrategies: () => void;
    onAddDefaultStrategy: () => void;
    onClose: () => void;
    environment?: string;
    featureId: string;
    showBanner?: boolean;
}

export const EnableEnvironmentDialog: FC<IEnableEnvironmentDialogProps> = ({
    isOpen,
    onAddDefaultStrategy,
    onActivateDisabledStrategies,
    onClose,
    environment,
    featureId,
}) => {
    const projectId = useRequiredPathParam('projectId');

    const { feature } = useFeature(projectId, featureId);

    const disabledStrategiesCount = feature.environments
        ?.find(({ name }) => name === environment)
        ?.strategies?.filter(({ disabled }) => disabled).length;

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
            title={`Enable feature flag in ${environment}`}
            fullWidth
        >
            <Typography sx={{ mb: (theme) => theme.spacing(3) }}>
                A feature flag cannot be enabled without an enabled strategy.
            </Typography>
            <Typography>
                To enable this feature flag you can choose to:
            </Typography>
            <StyledList>
                <li>
                    <Typography>
                        <strong>Add the default strategy</strong>
                    </Typography>
                </li>
                <li>
                    <Typography>
                        <strong>Enable all the disabled strategies</strong>{' '}
                        (this feature flag has {disabledStrategiesText})
                    </Typography>
                </li>
            </StyledList>
        </Dialogue>
    );
};
