import Check from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import { styled } from '@mui/material';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const StyledCheck = styled(Check)(({ theme }) => ({
    color:
        theme.mode === 'light'
            ? theme.palette.secondary.border
            : theme.palette.primary.main,
}));

const StyledCancel = styled(Warning)(({ theme }) => ({
    color:
        theme.mode === 'light'
            ? theme.palette.warning.border
            : theme.palette.warning.main,
}));

const CheckMarkBadge = ({ type }: ICheckMarkBadgeProps) => {
    return type === 'error' ? (
        <StyledCancel titleAccess='Error' />
    ) : (
        <StyledCheck />
    );
};

export default CheckMarkBadge;
