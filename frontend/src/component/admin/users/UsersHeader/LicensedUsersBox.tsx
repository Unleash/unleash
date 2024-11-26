import { Box, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useState } from 'react';
import { LicensedUsersSidebar } from './LicensedUsersSidebar';

const StyledButton = styled('button')(({ theme }) => ({
    background: 'none',
    border: 'none',
    fontSize: 'inherit',
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    padding: 0,
}));

const TopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledCaption = styled('figcaption')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
}));

const Grid = styled('figure')(({ theme }) => ({
    margin: 0,
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
}));

export const LicensedUsersBox = () => {
    const [licensedUsersChartOpen, setLicensedUsersChartOpen] = useState(false);
    return (
        <Grid>
            <TopRow>
                <span>11/25</span>
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
            </TopRow>

            <StyledCaption>
                <span>Seats used in the last 30 days</span>
                <StyledButton
                    onClick={() => {
                        setLicensedUsersChartOpen(true);
                    }}
                >
                    View graph over time
                </StyledButton>
            </StyledCaption>
            <LicensedUsersSidebar
                open={licensedUsersChartOpen}
                close={() => setLicensedUsersChartOpen(false)}
            />
        </Grid>
    );
};
