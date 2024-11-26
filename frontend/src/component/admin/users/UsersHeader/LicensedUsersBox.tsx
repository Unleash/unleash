import { Box, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useState } from 'react';
import { LicensedUsersSidebar } from './LicensedUsersSidebar';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
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

const InvisibleParagraph = styled('dl')(({ theme }) => ({
    display: 'contents',
    '& dt': {
        gridArea: 'c',
        display: 'flex',
        flexFlow: 'row wrap',
        gap: theme.spacing(2),
        justifyContent: 'space-between',
    },
    '& dd': {
        gridArea: 'a',
        display: 'flex',
        flexFlow: 'row wrap',
        gap: theme.spacing(2),
        justifyContent: 'space-between',
    },
}));

const Grid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        'a'
        'c'
    `,
    gap: theme.spacing(2),
}));

export const LicensedUsersBox = () => {
    const [licensedUsersChartOpen, setLicensedUsersChartOpen] = useState(false);
    return (
        <StyledContainer>
            <Grid>
                <InvisibleParagraph>
                    <dt>
                        <span>Seats used last 30 days</span>
                        <StyledButton
                            onClick={() => {
                                setLicensedUsersChartOpen(true);
                            }}
                        >
                            View graph over time
                        </StyledButton>
                    </dt>
                    <dd>
                        <span>11/25</span>
                        <HelpIcon
                            // sx={{ gridArea: 'b' }}
                            htmlTooltip
                            tooltip={
                                <Box>
                                    A licensed seat is a unique user that had
                                    access to your instance within the last 30
                                    days, and thereby occupied a seat.
                                </Box>
                            }
                        />
                    </dd>
                </InvisibleParagraph>
            </Grid>

            <RightColumn>
                <LicensedUsersSidebar
                    open={licensedUsersChartOpen}
                    close={() => setLicensedUsersChartOpen(false)}
                />
            </RightColumn>
        </StyledContainer>
    );
};
