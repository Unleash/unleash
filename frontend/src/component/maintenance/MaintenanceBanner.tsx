import { styled } from '@mui/material';
import { ErrorOutlineRounded } from '@mui/icons-material';

const StyledErrorRoundedIcon = styled(ErrorOutlineRounded)(({ theme }) => ({
    color: theme.palette.error.main,
    height: '20px',
    width: '20px',
    marginRight: theme.spacing(1),
}));

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    fontSize: theme.fontSizes.smallBody,
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.error.contrastText,
    backgroundColor: theme.palette.error.light,
    height: '65px',
    borderBottom: `1px solid ${theme.palette.error.border}`,
    whiteSpace: 'pre-wrap',
}));

const MaintenanceBanner = () => {
    return (
        <StyledDiv>
            <StyledErrorRoundedIcon />
            <b>Maintenance Mode! </b>
            <p>
                During maintenance mode, any changes made will not be saved and
                you may receive an error. We apologize for any inconvenience
                this may cause.
            </p>
        </StyledDiv>
    );
};

export default MaintenanceBanner;
