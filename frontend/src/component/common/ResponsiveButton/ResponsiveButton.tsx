import { IconButton, Tooltip, Button, useMediaQuery } from '@material-ui/core';
import ConditionallyRender from '../ConditionallyRender';

interface IResponsiveButtonProps {
    Icon: React.ElementType;
    onClick: () => void;
    tooltip?: string;
    maxWidth: string;
}

const ResponsiveButton = ({
    Icon,
    onClick,
    maxWidth,
    tooltip,
}: IResponsiveButtonProps) => {
    const smallScreen = useMediaQuery(`(max-width:${maxWidth})`);

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <Tooltip title={tooltip ? tooltip : ''}>
                    <IconButton onClick={onClick}>
                        <Icon />
                    </IconButton>
                </Tooltip>
            }
            elseShow={
                <Button onClick={onClick} color="primary" variant="contained">
                    Add new project
                </Button>
            }
        />
    );
};

export default ResponsiveButton;
