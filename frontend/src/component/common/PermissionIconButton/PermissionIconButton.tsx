import { IconButton, Tooltip, IconButtonProps } from '@material-ui/core';
import React, { useContext, ReactNode } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Link } from 'react-router-dom';

interface IPermissionIconButtonProps {
    permission: string;
    projectId?: string;
    environmentId?: string;
    className?: string;
    title?: string;
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
    ...rest
}: IButtonProps | ILinkProps) => {
    const { hasAccess } = useContext(AccessContext);
    let access;

    if (projectId && environmentId) {
        access = hasAccess(permission, projectId, environmentId);
    } else if (projectId) {
        access = hasAccess(permission, projectId);
    } else {
        access = hasAccess(permission);
    }

    const tooltipText = !access
        ? "You don't have access to perform this operation"
        : '';

    return (
        <Tooltip title={tooltipText} arrow>
            <span>
                <IconButton disabled={!access} {...rest}>
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default PermissionIconButton;
