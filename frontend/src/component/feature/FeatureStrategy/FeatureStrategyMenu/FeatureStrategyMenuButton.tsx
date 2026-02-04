import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { styled } from '@mui/material';

interface IFeatureStrategyMenuButtonProps {
    label: string;
    projectId: string;
    environmentId: string;
    dialogId?: string;
    onClick: any;
    variant?: IPermissionButtonProps['variant'];
    matchWidth?: boolean;
    disableReason?: string;
}

const StyledStrategyMenu = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
}));

export const FeatureStrategyMenuButton = ({
    label,
    projectId,
    environmentId,
    dialogId,
    onClick,
    variant,
    matchWidth,
    disableReason,
}: IFeatureStrategyMenuButtonProps) => {
    return (
        <StyledStrategyMenu onClick={(event) => event.stopPropagation()}>
            <PermissionButton
                data-testid='ADD_STRATEGY_BUTTON'
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={onClick}
                aria-labelledby={dialogId}
                variant={variant}
                sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
                disabled={Boolean(disableReason)}
                tooltipProps={{
                    title: disableReason ? disableReason : undefined,
                }}
            >
                {label}
            </PermissionButton>
        </StyledStrategyMenu>
    );
};
