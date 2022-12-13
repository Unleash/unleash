import { Switch, SwitchProps } from '@mui/material';
import React from 'react';
import { formatAccessText } from 'utils/formatAccessText';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { useHasAccess } from '../../../hooks/useHasAccess';

interface IPermissionSwitchProps extends SwitchProps {
    permission: string;
    tooltip?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
    checked: boolean;
}

const PermissionSwitch = React.forwardRef<
    HTMLButtonElement,
    IPermissionSwitchProps
>((props, ref) => {
    const {
        permission,
        tooltip,
        disabled,
        projectId,
        environmentId,
        checked,
        onChange,
        ...rest
    } = props;

    const access = useHasAccess(permission, environmentId, projectId);

    return (
        <TooltipResolver title={formatAccessText(access, tooltip)} arrow>
            <span data-loading>
                <Switch
                    data-testid="toggle-switch"
                    onChange={onChange}
                    disabled={disabled || !access}
                    checked={checked}
                    ref={ref}
                    {...rest}
                />
            </span>
        </TooltipResolver>
    );
});

export default PermissionSwitch;
