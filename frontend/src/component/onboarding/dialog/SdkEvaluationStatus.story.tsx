import { styled, Typography } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { ListeningStatus, SdkConnectionStatus } from './SdkEvaluationStatus';

export const meta: StoryMeta = {
    title: 'Onboarding/SdkEvaluationStatus',
    background: 'paper',
};

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    maxWidth: 600,
}));

const Section = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const Default: Story = () => (
    <Container>
        <Section>
            <Typography variant='subtitle2'>
                ListeningStatus — waiting
            </Typography>
            <ListeningStatus evaluated={false} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                ListeningStatus — evaluated
            </Typography>
            <ListeningStatus evaluated={true} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                SdkConnectionStatus — waiting
            </Typography>
            <SdkConnectionStatus sdkConnected={false} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                SdkConnectionStatus — waiting with troubleshooting
            </Typography>
            <SdkConnectionStatus sdkConnected={false} showTroubleshooting />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                SdkConnectionStatus — connected
            </Typography>
            <SdkConnectionStatus sdkConnected={true} />
        </Section>
    </Container>
);
