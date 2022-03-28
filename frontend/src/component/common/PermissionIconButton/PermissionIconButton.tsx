import { IconButton, Tooltip, IconButtonProps } from '@material-ui/core';
import React, { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';

interface IPermissionIconButtonProps extends IconButtonProps {
    permission: string;
    Icon?: React.ElementType;
    onClick?: (e: any) => void;
    projectId?: string;
    environmentId?: string;
    className?: string;
    title?: string;
}

const PermissionIconButton: React.FC<IPermissionIconButtonProps> = ({
    permission,
    Icon,
    onClick,
    projectId,
    children,
    environmentId,
    ...rest
}) => {
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
                <IconButton onClick={onClick} disabled={!access} {...rest}>
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default PermissionIconButton;
