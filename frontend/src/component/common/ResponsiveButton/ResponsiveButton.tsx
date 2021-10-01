import { IconButton, Tooltip, Button, useMediaQuery } from '@material-ui/core';
import ConditionallyRender from '../ConditionallyRender';

interface IResponsiveButtonProps {
    Icon: React.ElementType;
    onClick: () => void;
    tooltip?: string;
    disabled?: boolean;
    maxWidth: string;
}

const ResponsiveButton: React.FC<IResponsiveButtonProps> = ({
    Icon,
    onClick,
    maxWidth,
    tooltip,
    disabled = false,
    children,
    ...rest
}) => {
    const smallScreen = useMediaQuery(`(max-width:${maxWidth})`);

    return (
        <Tooltip title={tooltip ? tooltip : ''} arrow>
            <span>
            <ConditionallyRender
                condition={smallScreen}
                show={
                    <IconButton disabled={disabled} onClick={onClick} data-loading {...rest}>
                        <Icon />
                    </IconButton>
                }
                elseShow={
                    <Button
                        onClick={onClick}
                        color="primary"
                        variant="contained"
                        disabled={disabled}
                        data-loading
                        {...rest}
                    >
                        {children}
                    </Button>
                }
            />
            </span>
        </Tooltip>
    );
};

export default ResponsiveButton;
