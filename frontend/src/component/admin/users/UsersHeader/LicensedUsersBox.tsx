import { Box, Button, styled, Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledColumn = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const RightColumn = styled(StyledColumn)({
    alignItems: 'flex-end',
});

const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: theme.spacing(1.75),
    textDecoration: 'underline',
    textAlign: 'right',
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    fontWeight: theme.typography.h4.fontWeight,
}));

const InvisibleParagraph = styled('p')({
    display: 'contents',
});

export const LicensedUsersBox = () => {
    return (
        <StyledContainer>
            <StyledColumn>
                <InvisibleParagraph>
                    <Typography
                        variant='body1'
                        fontWeight='bold'
                        component='span'
                    >
                        11/25
                    </Typography>
                    <Typography variant='body2' component='span'>
                        Seats used last 30 days
                    </Typography>
                </InvisibleParagraph>
            </StyledColumn>
            <RightColumn>
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
                <StyledButton onClick={() => {}}>
                    View graph over time
                </StyledButton>
            </RightColumn>
        </StyledContainer>
    );
};
