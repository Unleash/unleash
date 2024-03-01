import { ReactNode, VFC } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import { ReviewsOutlined } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { ShareLink } from './ShareLink/ShareLink';

type DashboardHeaderProps = {
    actions?: ReactNode;
};

export const DashboardHeader: VFC<DashboardHeaderProps> = ({ actions }) => {
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
                    <span>Insights</span> <Badge color='success'>Beta</Badge>
                </Typography>
            }
            actions={
                <>
                    {actions}
                    <ShareLink />
                    <Button
                        startIcon={<ReviewsOutlined />}
                        variant='outlined'
                        onClick={createFeedbackContext}
                    >
                        Provide feedback
                    </Button>
                </>
            }
        />
    );
};
