import { useState, VFC } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useStyles as useAppStyles } from 'component/App.styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EditGroupUsers } from '../../../../admin/groups/Group/EditGroupUsers/EditGroupUsers';
import { SuggestedChanges } from '../SuggestedChanges';

interface IDraftBannerProps {
    environment?: string;
}

export const DraftBanner: VFC<IDraftBannerProps> = ({ environment }) => {
    const { classes } = useAppStyles();
    const [reviewChangesOpen, setReviewChangesOpen] = useState(false);

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: theme => theme.zIndex.appBar,
                borderTop: theme => `1px solid ${theme.palette.warning.border}`,
                borderBottom: theme =>
                    `1px solid ${theme.palette.warning.border}`,
                backgroundColor: theme => theme.palette.warning.light,
            }}
        >
            <Box className={classes.content}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 1.5,
                        color: theme => theme.palette.warning.main,
                    }}
                >
                    <WarningAmberIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                        <strong>Draft mode!</strong> – You have changes{' '}
                        <ConditionallyRender
                            condition={Boolean(environment)}
                            show={
                                <>
                                    in <strong>{environment} </strong>
                                </>
                            }
                        />
                        that need to be reviewed
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setReviewChangesOpen(true)}
                        sx={{ ml: 'auto' }}
                    >
                        Review changes
                    </Button>
                    <Button variant="text" onClick={() => {}} sx={{ ml: 1 }}>
                        Discard all
                    </Button>
                </Box>
            </Box>
            <SuggestedChanges
                open={reviewChangesOpen}
                setOpen={setReviewChangesOpen}
            />
        </Box>
    );
};
