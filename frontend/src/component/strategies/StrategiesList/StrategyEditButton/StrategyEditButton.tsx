import { VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { IStrategy } from 'interfaces/strategy';
import { useId } from 'hooks/useId';

interface IStrategyEditButtonProps {
    strategy: IStrategy;
    onClick: () => void;
}

export const StrategyEditButton: VFC<IStrategyEditButtonProps> = ({
    strategy,
    onClick,
}) => {
    const id = useId();

    return (
        <ConditionallyRender
            condition={strategy?.editable}
            show={
                <PermissionIconButton
                    onClick={onClick}
                    permission={UPDATE_STRATEGY}
                    tooltipProps={{ title: 'Edit strategy' }}
                >
                    <Edit />
                </PermissionIconButton>
            }
            elseShow={
                <Tooltip title="You cannot edit a built-in strategy" arrow>
                    <div id={id}>
                        <IconButton disabled size="large">
                            <Edit aria-labelledby={id} />
                        </IconButton>
                    </div>
                </Tooltip>
            }
        />
    );
};
