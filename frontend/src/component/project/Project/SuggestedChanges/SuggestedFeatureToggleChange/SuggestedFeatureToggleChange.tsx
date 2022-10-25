import { FC } from 'react';
import { Box, Card, Typography } from '@mui/material';

interface ISuggestedFeatureToggleChange {
    featureToggleName: string;
}

export const SuggestedFeatureToggleChange: FC<
    ISuggestedFeatureToggleChange
> = ({ featureToggleName, children }) => {
    return (
        <Card
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                borderRadius: theme => `${theme.shape.borderRadius}px`,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme => theme.palette.dividerAlternative,
            })}
        >
            <Box
                sx={theme => ({
                    backgroundColor: theme =>
                        theme.palette.tableHeaderBackground,
                    p: 2,
                })}
            >
                <Typography>{featureToggleName}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>{children}</Box>
        </Card>
    );
};
