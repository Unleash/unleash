import { Box, styled, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { FC } from 'react';
import { PageHeader } from '../../../common/PageHeader/PageHeader';

const StyledHelpOutline = styled(HelpOutline)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginLeft: '0.3rem',
    color: theme.palette.action.active,
}));

const StyledHeaderHint = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

export const ReviewChangesHeader: FC = () => (
    <PageHeader
        actions={''}
        titleElement={
            <>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    Review your changes
                    <Tooltip
                        title="Here you can see all the changes that you are suggesting and you can send them for review. You can still discard the changes after you sent them for review or even cancel the entire review if you need it"
                        arrow
                    >
                        <StyledHelpOutline />
                    </Tooltip>
                </Box>
                <StyledHeaderHint>
                    Make sure you are sending the right changes to be reviewed
                </StyledHeaderHint>
            </>
        }
    />
);
