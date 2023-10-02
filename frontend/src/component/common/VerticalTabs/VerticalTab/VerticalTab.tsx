import { Button, styled } from '@mui/material';

const StyledTab = styled(Button)<{ selected: boolean }>(
    ({ theme, selected }) => ({
        '&.MuiButton-root': {
            cursor: 'pointer',
            height: theme.spacing(6.5),
            border: 0,
            backgroundColor: selected
                ? theme.palette.background.paper
                : 'transparent',
            borderLeft: `${theme.spacing(1)} solid ${
                selected ? theme.palette.background.alternative : 'transparent'
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
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        justifyContent: 'space-between',
        '& > span': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
    }),
);

interface IVerticalTabProps {
    label: string;
    selected?: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}

export const VerticalTab = ({
    label,
    selected,
    onClick,
    icon,
}: IVerticalTabProps) => (
    <StyledTab
        selected={Boolean(selected)}
        onClick={onClick}
        disableElevation
        disableFocusRipple
        fullWidth
    >
        {label}
        {icon}
    </StyledTab>
);
