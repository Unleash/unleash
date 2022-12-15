import { styled } from '@mui/material';
import { ErrorOutlineRounded } from '@mui/icons-material';

const StyledErrorRoundedIcon = styled(ErrorOutlineRounded)(({ theme }) => ({
    height: '20px',
    width: '20px',
    marginRight: theme.spacing(1),
}));

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    fontSize: theme.fontSizes.smallBody,
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.light,
    height: '65px',
    borderBottom: `1px solid ${theme.palette.error.border}`,
    whiteSpace: 'pre-wrap',
}));

const Maintenance = () => {
    return (
        <StyledDiv>
            <StyledErrorRoundedIcon />
            <b>Maintenance Mode! </b>
            <p>
                Any changes you make during maintenance mode will not be saved.
                We apologize for any inconvenience this may cause.
            </p>
        </StyledDiv>
    );
};

export default Maintenance;
