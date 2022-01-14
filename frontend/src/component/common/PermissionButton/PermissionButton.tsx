import { Button, Tooltip } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import { useContext } from 'react';
import AccessContext from '../../../contexts/AccessContext';
import ConditionallyRender from '../ConditionallyRender';

interface IPermissionIconButtonProps
    extends React.HTMLProps<HTMLButtonElement> {
    permission: string | string[];
    tooltip?: string;
    onClick?: (e: any) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
}

const PermissionButton: React.FC<IPermissionIconButtonProps> = ({
    permission,
    tooltip = 'Click to perform action',
    onClick,
    children,
    disabled,
    projectId,
    environmentId,
    ...rest
}) => {
    const { hasAccess } = useContext(AccessContext);
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

    const tooltipText = access
        ? tooltip
        : "You don't have access to perform this operation";

    return (
        <Tooltip title={tooltipText} arrow>
            <span>
                <Button
                    onClick={onClick}
                    disabled={disabled || !access}
                    variant="contained"
                    color="primary"
                    {...rest}
                    endIcon={
                        <ConditionallyRender
                            condition={!access}
                            show={<Lock />}
                        />
                    }
                >
                    {children}
                </Button>
            </span>
        </Tooltip>
    );
};

export default PermissionButton;
