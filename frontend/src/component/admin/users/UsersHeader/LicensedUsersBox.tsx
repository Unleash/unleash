import { Box, Link, styled, Typography } from '@mui/material';
import { HelpIcon } from '../../../common/HelpIcon/HelpIcon';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
}));

const StyledRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
});

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.spacing(1.75),
}));

export const LicensedUsersBox = () => {
    return (
        <StyledContainer>
            <StyledRow>
                <Typography variant='body1' fontWeight='bold'>
                    11/25
                </Typography>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <Box>
                            A licensed seat is a unique user that had access to
                            your instance within the last 30 days, and thereby
                            occupied a seat.
                        </Box>
                    }
                />
            </StyledRow>
            <StyledRow>
                <Typography variant='body2'>
                    {' '}
                    Seats used last 30 days
                </Typography>
                <StyledLink onClick={() => {}}>
                    {' '}
                    View graph over time
                </StyledLink>
            </StyledRow>
        </StyledContainer>
    );
};
