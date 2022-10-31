import { Box, Divider, Typography, useTheme } from '@mui/material';
import Cancel from '@mui/icons-material/Cancel';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';

export const SuggestedChangeReviewStatus = () => {
    const theme = useTheme();
    const cancel = (
        <Cancel
            sx={theme => ({
                color: theme.palette.error.main,
                height: '35px',
                width: '35px',
                marginRight: theme.spacing(1),
            })}
        />
    );

    return (
        <Box sx={theme => ({ display: 'flex', marginTop: theme.spacing(2) })}>
            <Box
                sx={theme => ({
                    borderRadius: theme =>
                        `${theme.shape.borderRadiusMedium}px`,
                    backgroundColor: theme.palette.tableHeaderBackground,
                    padding: theme.spacing(1, 2),
                    marginRight: theme.spacing(2),
                    height: '45px',
                    width: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                })}
            >
                <ChangesAppliedIcon
                    style={{
                        transform: `scale(1.5)`,
                        color: theme.palette.neutral.main,
                    }}
                />
            </Box>
            <Box
                sx={theme => ({
                    borderRadius: `${theme.shape.borderRadiusLarge}px`,
                    border: `1px solid ${theme.palette.dividerAlternative}`,
                    padding: theme.spacing(3),
                    width: '100%',
                })}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {cancel}
                    <Box>
                        <Typography
                            sx={theme => ({
                                fontWeight: 'bold',
                                color: theme.palette.error.main,
                            })}
                        >
                            Review required
                        </Typography>
                        <Typography>
                            At least 1 approving review must be submitted before
                            changes can be applied
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={theme => ({ margin: theme.spacing(2.5, 0) })} />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {cancel}
                    <Typography
                        sx={theme => ({
                            fontWeight: 'bold',
                            color: theme.palette.error.main,
                        })}
                    >
                        Apply changes is blocked
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
