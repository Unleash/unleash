import { styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
}));

const ActionBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(4, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

export const SetupComplete: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox>
            <TitleContainer>
                <Lightbulb color='primary' />
                <h3>Project Insight</h3>
            </TitleContainer>
            <Typography>
                This project already has connected SDKs and existing feature
                flags.
            </Typography>

            <Typography>
                <Link to={`/projects/${project}?create=true`}>
                    Create a new feature flag
                </Link>{' '}
                or go to the{' '}
                <Link to={`/projects/${project}`} title={project}>
                    go to the project
                </Link>{' '}
                to work with existing flags
            </Typography>
        </ActionBox>
    );
};
