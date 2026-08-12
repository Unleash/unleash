import { useState } from 'react';
import { IconButton, Paper, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { SurveyConfig } from './surveys.ts';

const StyledCard = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.tooltip,
    maxWidth: 360,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

interface UxSurveyCardProps {
    survey: SurveyConfig;
}

export const UxSurveyCard = ({ survey }: UxSurveyCardProps) => {
    const [closed, setClosed] = useState(false);

    if (closed) {
        return null;
    }

    return (
        <StyledCard elevation={8} role='complementary' aria-label='Survey'>
            <StyledCloseButton
                aria-label='Close survey'
                size='small'
                onClick={() => setClosed(true)}
            >
                <CloseIcon fontSize='small' />
            </StyledCloseButton>
            <Typography variant='h3' component='h2'>
                {survey.title}
            </Typography>
            {survey.intro ? (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                >
                    {survey.intro}
                </Typography>
            ) : null}
        </StyledCard>
    );
};
