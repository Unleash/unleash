import { VFC } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import { ReviewsOutlined } from '@mui/icons-material';
import { Badge, Button, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

export const DashboardHeader: VFC = () => {
    const showInactiveUsers = useUiFlag('showInactiveUsers');

    const { openFeedback } = useFeedback(
        'insights',
        'automatic',
        showInactiveUsers ? 'withInactiveUsers' : 'withoutInactiveUsers',
    );

    const createFeedbackContext = () => {
        openFeedback({
            title: 'How easy was it to use insights?',
            positiveLabel: 'What do you like most about insights?',
            areasForImprovementsLabel: 'What should be improved in insights?',
        });
    };

    return (
        <PageHeader
            titleElement={
                <Typography
                    variant='h1'
                    component='div'
                    sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing(1),
                    })}
                >
                    <span>Insights</span> <Badge color='warning'>Beta</Badge>
                </Typography>
            }
            actions={
                <Button
                    startIcon={<ReviewsOutlined />}
                    variant='outlined'
                    onClick={createFeedbackContext}
                    size='small'
                >
                    Provide feedback
                </Button>
            }
        />
    );
};
