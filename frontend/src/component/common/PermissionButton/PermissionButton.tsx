import { Button, ButtonProps } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import AccessContext from 'contexts/AccessContext';
import React, { useContext } from 'react';
import ConditionallyRender from '../ConditionallyRender';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';

export interface IPermissionButtonProps extends Omit<ButtonProps, 'title'> {
    permission: string | string[];
    onClick?: (e: any) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
    tooltip?: string;
}

const PermissionButton: React.FC<IPermissionButtonProps> = ({
    permission,
    variant = 'contained',
    color = 'primary',
    onClick,
    children,
    disabled,
    projectId,
    environmentId,
    tooltip,
    ...rest
}) => {
    const { hasAccess } = useContext(AccessContext);
    const id = useId();
    let access;

    const handleAccess = () => {
        let access;
        if (Array.isArray(permission)) {
            access = permission.some(permission => {
                if (projectId && environmentId) {
                    return hasAccess(permission, projectId, environmentId);
                } else if (projectId) {
                    return hasAccess(permission, projectId);
                } else {
                    return hasAccess(permission);
                }
            });
        } else {
            if (projectId && environmentId) {
                access = hasAccess(permission, projectId, environmentId);
            } else if (projectId) {
                access = hasAccess(permission, projectId);
            } else {
                access = hasAccess(permission);
            }
        }

        return access;
    };

    access = handleAccess();

    return (
        <TooltipResolver title={formatAccessText(access, tooltip)} arrow>
            <span id={id}>
                <Button
                    onClick={onClick}
                    disabled={disabled || !access}
                    aria-describedby={id}
                    variant={variant}
                    color={color}
                    {...rest}
                    endIcon={
                        <ConditionallyRender
                            condition={!access}
                            show={<Lock titleAccess="Locked" />}
                        />
                    }
                >
                    {children}
                </Button>
            </span>
        </TooltipResolver>
    );
};

export default PermissionButton;
