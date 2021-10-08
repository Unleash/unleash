import { Button, Tooltip } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { Lock } from '@material-ui/icons';
import { useContext } from 'react';
import AccessContext from '../../../contexts/AccessContext';
import ConditionallyRender from '../ConditionallyRender';

interface IPermissionIconButtonProps extends OverridableComponent<any> {
    permission: string;
    tooltip: string;
    onClick?: (e: any) => void;
    disabled?: boolean;
}

const PermissionButton: React.FC<IPermissionIconButtonProps> = ({
    permission,
    tooltip = 'Click to perform action',
    onClick,
    children,
    disabled,
    ...rest
}) => {
    const { hasAccess } = useContext(AccessContext);

    const access = hasAccess(permission);
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
