import type { VFC } from 'react';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Delete from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import type { IStrategy } from 'interfaces/strategy';
import { DELETE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { useId } from 'hooks/useId';

interface IStrategyDeleteButtonProps {
    strategy: IStrategy;
    onClick: () => void;
}

export const StrategyDeleteButton: VFC<IStrategyDeleteButtonProps> = ({
    strategy,
    onClick,
}) => {
    const id = useId();

    return strategy?.editable ? (
        <PermissionIconButton
            onClick={onClick}
            permission={DELETE_STRATEGY}
            tooltipProps={{ title: 'Delete strategy' }}
        >
            <Delete />
        </PermissionIconButton>
    ) : (
        <Tooltip title='You cannot delete a built-in strategy' arrow>
            <div id={id}>
                <IconButton disabled size='large'>
                    <Delete aria-labelledby={id} />
                </IconButton>
            </div>
        </Tooltip>
    );
};
