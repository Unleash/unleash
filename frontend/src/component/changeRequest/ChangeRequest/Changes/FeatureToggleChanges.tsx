import type React from 'react';
import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography, Link } from '@mui/material';
import { ConflictWarning } from './Change/ConflictWarning.tsx';

interface IFeatureToggleChanges {
    featureName: string;
    projectId: string;
    conflict?: string;
    onNavigate?: () => void;
    children?: React.ReactNode;
}

export const FeatureToggleChanges: FC<IFeatureToggleChanges> = ({
    featureName,
    projectId,
    conflict,
    onNavigate,
    children,
}) => (
    <Card
        elevation={0}
        sx={(theme) => ({
            marginTop: theme.spacing(2),
            overflow: 'hidden',
        })}
    >
        <Box
            sx={(theme) => ({
                backgroundColor: conflict
                    ? theme.palette.neutral.light
                    : theme.palette.neutral.light,
                borderRadius: (theme) =>
                    `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
                border: '1px solid',
                borderColor: (theme) =>
                    conflict
                        ? theme.palette.warning.border
                        : theme.palette.divider,
                borderBottom: 'none',
                overflow: 'hidden',
            })}
        >
            <ConflictWarning conflict={conflict} />
            <Box
                sx={{
                    display: 'flex',
                    pt: conflict ? 0 : 2,
                    pb: 2,
                    px: 3,
                }}
            >
                <Typography>Feature flag name: </Typography>

                <Link
                    component={RouterLink}
                    to={`/projects/${projectId}/features/${featureName}`}
                    color='primary'
                    underline='hover'
                    sx={{
                        marginLeft: 1,
                        '& :hover': {
                            textDecoration: 'underline',
                        },
                    }}
                    onClick={onNavigate}
                >
                    <strong>{featureName}</strong>
                </Link>
            </Box>
        </Box>
        <Box>{children}</Box>
    </Card>
);
