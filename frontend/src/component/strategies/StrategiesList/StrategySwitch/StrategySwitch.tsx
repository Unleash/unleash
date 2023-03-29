import { useMemo, VFC } from 'react';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Tooltip } from '@mui/material';
import { useId } from 'hooks/useId';
import { useHasRootAccess } from 'hooks/useHasAccess';

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
    const access = useHasRootAccess(UPDATE_STRATEGY);

    const title = useMemo(() => {
        if (!access) {
            return '';
        }

        if (disabled) {
            return 'You cannot disable default strategy';
        }

        return deprecated
            ? 'Excluded from strategy list'
            : 'Included in strategy list';
    }, [deprecated, disabled, access]);

    return (
        <Tooltip title={title} describeChild arrow>
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
