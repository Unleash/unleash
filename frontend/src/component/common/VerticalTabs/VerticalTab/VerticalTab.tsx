import { styled } from '@mui/material';

const StyledTab = styled('button')<{ selected: boolean }>(
    ({ theme, selected }) => ({
        cursor: 'pointer',
        border: 0,
        backgroundColor: selected
            ? theme.palette.background.paper
            : 'transparent',
        borderLeft: `${theme.spacing(1)} solid ${
            selected ? theme.palette.primary.main : 'transparent'
        }`,
        borderRadius: theme.shape.borderRadiusMedium,
        padding: theme.spacing(2, 4),
        color: theme.palette.text.primary,
        fontSize: theme.fontSizes.bodySize,
        fontWeight: selected ? theme.fontWeight.bold : theme.fontWeight.medium,
        textAlign: 'left',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: theme.palette.neutral.light,
        },
    })
);

interface IVerticalTabProps {
    label: string;
    selected?: boolean;
    onClick: () => void;
}

export const VerticalTab = ({
    label,
    selected,
    onClick,
}: IVerticalTabProps) => (
    <StyledTab selected={Boolean(selected)} onClick={onClick}>
        {label}
    </StyledTab>
);
