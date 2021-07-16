import { IconButton, Tooltip, Button, useMediaQuery } from '@material-ui/core';
import ConditionallyRender from '../ConditionallyRender';

interface IResponsiveButtonProps {
    Icon: React.ElementType;
    onClick: () => void;
    tooltip?: string;
    maxWidth: string;
}

const ResponsiveButton: React.FC<IResponsiveButtonProps> = ({
    Icon,
    onClick,
    maxWidth,
    tooltip,
    children,
}) => {
    const smallScreen = useMediaQuery(`(max-width:${maxWidth})`);

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <Tooltip title={tooltip ? tooltip : ''}>
                    <IconButton onClick={onClick} data-loading>
                        <Icon />
                    </IconButton>
                </Tooltip>
            }
            elseShow={
                <Button
                    onClick={onClick}
                    color="primary"
                    variant="contained"
                    data-loading
                >
                    {children}
                </Button>
            }
        />
    );
};

export default ResponsiveButton;
