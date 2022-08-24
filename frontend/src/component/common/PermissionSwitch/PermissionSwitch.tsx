import { Switch, SwitchProps } from '@mui/material';
import AccessContext from 'contexts/AccessContext';
import React, { useContext } from 'react';
import { formatAccessText } from 'utils/formatAccessText';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';

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

    const { hasAccess } = useContext(AccessContext);

    let access;
    if (projectId && environmentId) {
        access = hasAccess(permission, projectId, environmentId);
    } else if (projectId) {
        access = hasAccess(permission, projectId);
    } else {
        access = hasAccess(permission);
    }

    return (
        <TooltipResolver title={formatAccessText(access, tooltip)} arrow>
            <span data-loading>
                <Switch
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
