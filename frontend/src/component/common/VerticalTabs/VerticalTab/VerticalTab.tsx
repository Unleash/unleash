import { Button, styled } from '@mui/material';
import {
    ITooltipResolverProps,
    TooltipResolver,
} from '../../TooltipResolver/TooltipResolver';

const StyledTab = styled(Button)<{ selected: boolean }>(
    ({ theme, selected }) => ({
        '&.MuiButton-root': {
            cursor: 'pointer',
            height: '51px',
            border: 0,
            backgroundColor: selected
                ? theme.palette.background.paper
                : 'transparent',
            borderLeft: `${theme.spacing(1)} solid ${
                selected ? theme.palette.primary.main : 'transparent'
            }`,
            borderRadius: theme.shape.borderRadiusMedium,
            justifyContent: 'start',
            transition: 'background-color 0.2s ease',
            color: theme.palette.text.primary,
            textAlign: 'left',
            padding: theme.spacing(2, 4),
            fontSize: theme.fontSizes.bodySize,
            fontWeight: selected
                ? theme.fontWeight.bold
                : theme.fontWeight.medium,
            lineHeight: 1.2,
        },
        '&:hover': {
            backgroundColor: theme.palette.neutral.light,
        },
        '&.Mui-disabled': {
            pointerEvents: 'auto',
        },
        justifyContent: 'space-between',
    })
);

interface IVerticalTabProps {
    label: string;
    selected?: boolean;
    onClick: () => void;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
}

export const VerticalTab = ({
    label,
    selected,
    onClick,
    tooltipProps,
}: IVerticalTabProps) => (
    <TooltipResolver {...tooltipProps} arrow onClick={e => e.preventDefault()}>
        <StyledTab
            selected={Boolean(selected)}
            onClick={onClick}
            disableRipple
            disableElevation
            disableFocusRipple
            disableTouchRipple
            fullWidth
        >
            {label}
        </StyledTab>
    </TooltipResolver>
);
