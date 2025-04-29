import { Box, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useState } from 'react';
import { LicensedUsersSidebar } from './LicensedUsersSidebar.tsx';
import { useLicensedUsers } from 'hooks/useLicensedUsers';
import useLoading from 'hooks/useLoading';

const StyledButton = styled('button')(({ theme }) => ({
    background: 'none',
    border: 'none',
    fontSize: 'inherit',
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
}));

const TopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledCaption = styled('figcaption')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
}));

const Figure = styled('figure')(({ theme }) => ({
    margin: 0,
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
}));

const MainMetric = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
}));

const OpenSidebarButton = () => {
    const [licensedUsersChartOpen, setLicensedUsersChartOpen] = useState(false);

    return (
        <>
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
        </>
    );
};

export const LicensedUsersBox = () => {
    const { data, loading } = useLicensedUsers();
    const ref = useLoading(loading, '[data-loading-licensed-users=true]');
    return (
        <Figure ref={ref}>
            <TopRow>
                <MainMetric data-loading-licensed-users>
                    {data.licensedUsers.current}/{data.seatCount}
                </MainMetric>
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
                <span>Seats used over the last 30 days</span>
                <OpenSidebarButton />
            </StyledCaption>
        </Figure>
    );
};
