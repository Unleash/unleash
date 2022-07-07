import { VFC } from 'react';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Tooltip } from '@mui/material';
import { useId } from 'hooks/useId';

interface IStrategySwitchProps {
    deprecated: boolean;
    onToggle: (state: boolean) => void;
    disabled?: boolean;
}

export const StrategySwitch: VFC<IStrategySwitchProps> = ({
    deprecated,
    disabled,
    onToggle,
}) => {
    const onClick = () => {
        onToggle(deprecated);
    };
    const id = useId();

    const title = deprecated
        ? 'Excluded from strategy list'
        : 'Included in strategy list';

    return (
        <Tooltip
            title={disabled ? 'You cannot disable default strategy' : title}
            describeChild
            arrow
        >
            <div id={id}>
                <PermissionSwitch
                    checked={!deprecated}
                    permission={UPDATE_STRATEGY}
                    onClick={onClick}
                    disabled={disabled}
                    inputProps={{ 'aria-labelledby': id }}
                />
            </div>
        </Tooltip>
    );
};
