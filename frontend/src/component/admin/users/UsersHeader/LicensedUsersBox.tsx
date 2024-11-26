import { Box, styled, Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useState } from 'react';
import { LicensedUsersSidebar } from './LicensedUsersSidebar';

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

const StyledButton = styled('button')(({ theme }) => ({
    background: 'none',
    border: 'none',
    fontSize: theme.typography.body2.fontSize,
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    padding: 0,
}));

const InvisibleParagraph = styled('p')({
    display: 'contents',
});

export const LicensedUsersBox = () => {
    const [licensedUsersChartOpen, setLicensedUsersChartOpen] = useState(false);
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

                <StyledButton
                    onClick={() => {
                        setLicensedUsersChartOpen(true);
                    }}
                >
                    View graph over time
                </StyledButton>
                <LicensedUsersSidebar
                    open={licensedUsersChartOpen}
                    close={() => setLicensedUsersChartOpen(false)}
                />
            </RightColumn>
        </StyledContainer>
    );
};
