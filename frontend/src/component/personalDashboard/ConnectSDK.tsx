import { Button, styled, Typography } from '@mui/material';
import type { FC } from 'react';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const NeutralCircleContainer = styled('span')(({ theme }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutral.border,
    borderRadius: '50%',
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(4, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

export const CreateFlag: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox>
            <TitleContainer>
                <NeutralCircleContainer>1</NeutralCircleContainer>
                Create a feature flag
            </TitleContainer>
            <Typography>
                <div>The project currently holds no feature toggles.</div>
                <div>Create a feature flag to get started.</div>
            </Typography>
            <div>
                <Button href={`projects/${project}`} variant='contained'>
                    Go to project
                </Button>
            </div>
        </ActionBox>
    );
};

export const ConnectSDK: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox>
            {' '}
            <TitleContainer>
                <NeutralCircleContainer>2</NeutralCircleContainer>
                Connect an SDK
            </TitleContainer>
            <Typography>
                Your project is not yet connected to any SDK. In order to start
                using your feature flag connect an SDK to the project.
            </Typography>
            <div>
                <Button href={`projects/${project}`} variant='contained'>
                    Go to project
                </Button>
            </div>
        </ActionBox>
    );
};
