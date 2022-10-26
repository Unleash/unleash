import { FC } from 'react';
import { Box, Card, Typography } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

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
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme => theme.palette.dividerAlternative,
            })}
        >
            <Box
                sx={theme => ({
                    backgroundColor: theme.palette.tableHeaderBackground,
                    p: 2,
                })}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <ToggleOnIcon color="disabled" />
                    <Typography color="primary">{featureToggleName}</Typography>
                </Box>
            </Box>
            <Box sx={{ p: 2 }}>{children}</Box>
        </Card>
    );
};
