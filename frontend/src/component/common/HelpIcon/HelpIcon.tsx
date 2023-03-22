import { styled, Tooltip, TooltipProps } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

const StyledContainer = styled('span')(({ theme }) => ({
    display: 'inline-grid',
    alignItems: 'center',
    outline: 0,
    cursor: 'pointer',
    '&:is(:focus-visible, :active) > *, &:hover > *': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 0,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
        color: theme.palette.primary.main,
    },
    '& svg': {
        fontSize: theme.fontSizes.mainHeader,
        color: theme.palette.action.active,
        marginLeft: theme.spacing(0.5),
    },
}));

interface IHelpIconProps {
    tooltip: string;
    placement?: TooltipProps['placement'];
    children?: React.ReactNode;
}

export const HelpIcon = ({ tooltip, placement, children }: IHelpIconProps) => {
    return (
        <Tooltip title={tooltip} placement={placement} arrow>
            <StyledContainer tabIndex={0} aria-label="Help">
                {children ?? <HelpOutline />}
            </StyledContainer>
        </Tooltip>
    );
};
