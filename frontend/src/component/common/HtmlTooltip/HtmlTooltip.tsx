import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { SpacingArgument } from '@mui/system/createTheme/createSpacing';

const StyledHtmlTooltipBody = styled('div')(({ theme }) => ({
    overflow: 'auto',
    padding: theme.spacing(1, 1.5),
}));

const StyledHtmlTooltip = styled(
    ({
        className,
        maxWidth,
        maxHeight,
        fontSize,
        ...props
    }: IHtmlTooltipProps) => (
        <Tooltip
            {...props}
            title={<StyledHtmlTooltipBody>{props.title}</StyledHtmlTooltipBody>}
            classes={{ popper: className }}
        />
    ),
    {
        shouldForwardProp: prop =>
            prop !== 'maxWidth' && prop !== 'maxHeight' && prop !== 'fontSize',
    }
)<{
    maxWidth?: SpacingArgument;
    maxHeight?: SpacingArgument;
    fontSize?: string;
}>(
    ({
        theme,
        maxWidth = theme.spacing(37.5),
        maxHeight = theme.spacing(37.5),
        fontSize = theme.fontSizes.smallerBody,
    }) => ({
        maxWidth,
        [`& .${tooltipClasses.tooltip}`]: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            padding: 0,
            borderRadius: theme.shape.borderRadiusMedium,
            boxShadow: theme.shadows[2],
            color: theme.palette.text.primary,
            fontWeight: theme.fontWeight.medium,
            maxWidth: 'inherit',
            border: `1px solid ${theme.palette.divider}`,
            maxHeight,
            fontSize,
        },
        [`& .${tooltipClasses.arrow}`]: {
            '&:before': {
                border: `1px solid ${theme.palette.divider}`,
            },
            color: theme.palette.background.paper,
        },
    })
);

export interface IHtmlTooltipProps extends TooltipProps {
    maxWidth?: SpacingArgument;
    maxHeight?: SpacingArgument;
    fontSize?: string;
}

export const HtmlTooltip = (props: IHtmlTooltipProps) => {
    if (!Boolean(props.title)) return props.children;
    return <StyledHtmlTooltip {...props}>{props.children}</StyledHtmlTooltip>;
};
