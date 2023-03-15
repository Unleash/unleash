import { Check, Close } from '@mui/icons-material';
import { styled } from '@mui/material';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const StyledBatch = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.alternative,
    width: '75px',
    height: '75px',
    borderRadius: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        width: '50px',
        height: '50px',
    },
}));

const StyledClose = styled(Close)(({ theme }) => ({
    color: theme.palette.common.white,
    width: '35px',
    height: '35px',
}));
const StyledCheck = styled(Check)(({ theme }) => ({
    color: theme.palette.common.white,
    width: '35px',
    height: '35px',
}));

const CheckMarkBadge = ({ type, className }: ICheckMarkBadgeProps) => {
    return (
        <StyledBatch className={className}>
            {type === 'error' ? (
                <StyledClose titleAccess="Error" />
            ) : (
                <StyledCheck />
            )}
        </StyledBatch>
    );
};

export default CheckMarkBadge;
