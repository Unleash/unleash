import { styled, Tooltip, type TooltipProps } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import {
    HtmlTooltip,
    type IHtmlTooltipProps,
} from 'component/common/HtmlTooltip/HtmlTooltip';

const StyledContainer = styled('span')<{ size: string | undefined }>(
    ({ theme, size }) => ({
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
            fontSize: size || theme.fontSizes.mainHeader,
            color: theme.palette.action.active,
            marginLeft: theme.spacing(0.5),
        },
    }),
);

type IHelpIconProps = {
    tooltip: React.ReactNode;
    tooltipId?: string;
    placement?: TooltipProps['placement'];
    children?: React.ReactNode;
    size?: string;
} & (
    | {
          htmlTooltip: true;
          htmlTooltipMaxWidth?: IHtmlTooltipProps['maxWidth'];
      }
    | { htmlTooltip?: false }
);

export const HelpIcon = ({
    tooltip,
    htmlTooltip,
    tooltipId,
    placement,
    children,
    size,
    ...props
}: IHelpIconProps) => {
    if (htmlTooltip) {
        const { htmlTooltipMaxWidth } = props as {
            htmlTooltipMaxWidth?: IHtmlTooltipProps['maxWidth'];
        };

        return (
            <HtmlTooltip
                id={tooltipId}
                title={tooltip}
                placement={placement}
                arrow
                maxWidth={htmlTooltipMaxWidth}
            >
                <StyledContainer size={size} tabIndex={0} aria-label='Help'>
                    {children ?? <HelpOutline />}
                </StyledContainer>
            </HtmlTooltip>
        );
    }

    return (
        <Tooltip title={tooltip} placement={placement} arrow id={tooltipId}>
            <StyledContainer size={size} tabIndex={0} aria-label='Help'>
                {children ?? <HelpOutline />}
            </StyledContainer>
        </Tooltip>
    );
};
