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

const MainCircleContainer = styled(NeutralCircleContainer)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
}));

const SuccessContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',

    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
    backgroundColor: theme.palette.success.light,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2, 2, 2, 2),
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
        <ActionBox data-loading>
            <TitleContainer>
                <NeutralCircleContainer>1</NeutralCircleContainer>
                Create a feature flag
            </TitleContainer>
            <div>
                <p>The project currently holds no feature flags.</p>
                <p>Create one to get started.</p>
            </div>
            <div>
                <Button href={`projects/${project}`} variant='contained'>
                    Go to project
                </Button>
            </div>
        </ActionBox>
    );
};

export const ExistingFlag: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox>
            <TitleContainer>
                <MainCircleContainer>✓</MainCircleContainer>
                Create a feature flag
            </TitleContainer>
            <SuccessContainer>
                <Typography fontWeight='bold' variant='body2'>
                    You have created your first flag
                </Typography>
                <Typography variant='body2'>
                    Go to the project to customize the flag further.
                </Typography>
            </SuccessContainer>
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
        <ActionBox data-loading>
            <TitleContainer>
                <NeutralCircleContainer>2</NeutralCircleContainer>
                Connect an SDK
            </TitleContainer>
            <div>
                <p>Your project is not yet connected to any SDK.</p>
                <p>
                    To start using your feature flag, connect an SDK to the
                    project.
                </p>
            </div>
            <div>
                <Button href={`/projects/${project}`} variant='contained'>
                    Go to project
                </Button>
            </div>
        </ActionBox>
    );
};
