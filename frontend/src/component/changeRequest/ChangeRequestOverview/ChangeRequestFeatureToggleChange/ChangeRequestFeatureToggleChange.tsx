import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

interface IChangeRequestToggleChange {
    featureName: string;
    projectId: string;
    onNavigate?: () => void;
}

export const ChangeRequestFeatureToggleChange: FC<
    IChangeRequestToggleChange
> = ({ featureName, projectId, onNavigate, children }) => {
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
                    <Typography
                        component={Link}
                        to={`/projects/${projectId}/features/${featureName}`}
                        color="primary"
                        sx={{ textDecoration: 'none' }}
                        onClick={onNavigate}
                    >
                        {featureName}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ p: 2 }}>{children}</Box>
        </Card>
    );
};
