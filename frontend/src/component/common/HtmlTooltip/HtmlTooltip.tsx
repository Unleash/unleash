import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';

const StyledHtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        color: theme.palette.text.primary,
    },
}));

export const HtmlTooltip = (props: TooltipProps) => (
    <StyledHtmlTooltip {...props}>{props.children}</StyledHtmlTooltip>
);
