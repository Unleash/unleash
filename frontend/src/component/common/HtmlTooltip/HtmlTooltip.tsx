import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';

const StyledHtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    maxWidth: theme.spacing(37.5),
    [`& .${tooltipClasses.tooltip}`]: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.shape.borderRadiusMedium,
        boxShadow: theme.shadows[2],
        color: theme.palette.text.primary,
        fontWeight: theme.fontWeight.medium,
        maxWidth: 'inherit',
        border: `1px solid ${theme.palette.lightBorder}`,
    },
    [`& .${tooltipClasses.arrow}`]: {
        '&:before': {
            border: `1px solid ${theme.palette.lightBorder}`,
        },
        color: theme.palette.background.paper,
    },
}));

export const HtmlTooltip = (props: TooltipProps) => (
    <StyledHtmlTooltip {...props}>{props.children}</StyledHtmlTooltip>
);
