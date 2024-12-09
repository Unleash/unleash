import Check from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import { styled } from '@mui/material';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const StyledIcon = (icon: typeof Check) =>
    styled(icon)(({ theme }) => ({
        color:
            theme.mode === 'light'
                ? theme.palette.secondary.border
                : theme.palette.primary.main,
    }));

const StyledCancel = StyledIcon(Cancel);
const StyledCheck = StyledIcon(Check);

const CheckMarkBadge = ({ type }: ICheckMarkBadgeProps) => {
    return type === 'error' ? (
        <StyledCancel color='primary' titleAccess='Error' />
    ) : (
        <StyledCheck color='primary' />
    );
};

export default CheckMarkBadge;
