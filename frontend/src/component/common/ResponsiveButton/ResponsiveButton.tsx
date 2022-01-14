import { useMediaQuery } from '@material-ui/core';
import ConditionallyRender from '../ConditionallyRender';
import PermissionButton from '../PermissionButton/PermissionButton';
import PermissionIconButton from '../PermissionIconButton/PermissionIconButton';

interface IResponsiveButtonProps {
    Icon: React.ElementType;
    onClick: () => void;
    tooltip?: string;
    disabled?: boolean;
    permission?: string;
    projectId?: string;
    environmentId?: string;
    maxWidth: string;
}

const ResponsiveButton: React.FC<IResponsiveButtonProps> = ({
    Icon,
    onClick,
    maxWidth,
    tooltip,
    disabled = false,
    children,
    permission,
    environmentId,
    projectId,
    ...rest
}) => {
    const smallScreen = useMediaQuery(`(max-width:${maxWidth})`);

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    disabled={disabled}
                    onClick={onClick}
                    permission={permission}
                    projectId={projectId}
                    environmentId={environmentId}
                    data-loading
                    {...rest}
                >
                    <Icon />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    onClick={onClick}
                    permission={permission}
                    projectId={projectId}
                    color="primary"
                    variant="contained"
                    disabled={disabled}
                    environmentId={environmentId}
                    data-loading
                    {...rest}
                >
                    {children}
                </PermissionButton>
            }
        />
    );
};

export default ResponsiveButton;
