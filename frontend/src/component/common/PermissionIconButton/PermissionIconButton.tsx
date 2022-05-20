import { IconButton, IconButtonProps } from '@mui/material';
import React, { useContext, ReactNode } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Link } from 'react-router-dom';
import {
    TooltipResolver,
    ITooltipResolverProps,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';

interface IPermissionIconButtonProps {
    permission: string;
    projectId?: string;
    environmentId?: string;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    hidden?: boolean;
    type?: 'button';
    edge?: IconButtonProps['edge'];
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
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
    tooltipProps,
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

    return (
        <TooltipResolver
            {...tooltipProps}
            title={formatAccessText(access, tooltipProps?.title)}
            arrow
        >
            <div>
                <IconButton {...rest} disabled={!access} size="large">
                    {children}
                </IconButton>
            </div>
        </TooltipResolver>
    );
};

export default PermissionIconButton;
