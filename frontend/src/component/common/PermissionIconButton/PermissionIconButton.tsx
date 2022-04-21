import { IconButton, IconButtonProps } from '@material-ui/core';
import React, { useContext, ReactNode } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Link } from 'react-router-dom';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';

interface IPermissionIconButtonProps {
    permission: string;
    projectId?: string;
    environmentId?: string;
    className?: string;
    tooltip?: string;
    children?: ReactNode;
    disabled?: boolean;
    hidden?: boolean;
    type?: 'button';
    edge?: IconButtonProps['edge'];
}

interface IButtonProps extends IPermissionIconButtonProps {
    onClick: (event: React.SyntheticEvent) => void;
}

interface ILinkProps extends IPermissionIconButtonProps {
    component: typeof Link;
    to: string;
}

const PermissionIconButton = ({
    permission,
    projectId,
    children,
    environmentId,
    tooltip,
    ...rest
}: IButtonProps | ILinkProps) => {
    const { hasAccess } = useContext(AccessContext);
    const id = useId();
    let access;

    if (projectId && environmentId) {
        access = hasAccess(permission, projectId, environmentId);
    } else if (projectId) {
        access = hasAccess(permission, projectId);
    } else {
        access = hasAccess(permission);
    }

    return (
        <TooltipResolver title={formatAccessText(access, tooltip)}>
            <span id={id}>
                <IconButton {...rest} disabled={!access} aria-labelledby={id}>
                    {children}
                </IconButton>
            </span>
        </TooltipResolver>
    );
};

export default PermissionIconButton;
