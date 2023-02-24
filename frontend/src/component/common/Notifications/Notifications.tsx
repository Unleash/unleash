import Settings from '@mui/icons-material/Settings';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import { useNotifications } from 'hooks/api/getters/useNotifications/useNotifications';

export const Notifications = () => {
    const { notifications } = useNotifications({ refreshInterval: 15 });

    console.log(notifications);
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                minWidth: '400px',
                boxShadow: theme.boxShadows.popup,
                borderRadius: `${theme.shape.borderRadiusLarge}px`,
                position: 'absolute',
                right: -20,
                top: 60,
            })}
        >
            <Box
                sx={theme => ({
                    padding: theme.spacing(1, 3),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                })}
            >
                <Typography fontWeight="bold">Notifications</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton>
                        <Settings />
                    </IconButton>
                </Box>
            </Box>

            <Box
                sx={theme => ({
                    backgroundColor: theme.palette.neutral.light,
                    padding: theme.spacing(1, 3),
                })}
            >
                <Typography
                    sx={theme => ({
                        fontWeight: 'bold',
                        fontSize: theme.fontSizes.smallBody,
                        color: theme.palette.primary.main,
                        textAlign: 'center',
                    })}
                >
                    Mark all as read ({notifications?.length})
                </Typography>
            </Box>

            <Box sx={theme => ({ padding: theme.spacing(2, 3) })}>
                List goes here
            </Box>
        </Paper>
    );
};
