import { styled, Typography } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { SdkConnectionStatus } from './SdkEvaluationStatus';

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

const configureProps = {
    connectedTitle: 'We received metrics from your application',
    connectedBody: 'Your SDK is connected and evaluating flags.',
    waitingTitle: 'Waiting for SDK data...',
    waitingBody:
        'Run your app and evaluate your flag. This step completes on its own.',
};

const implementProps = {
    connectedTitle: 'Got the first evaluation!',
    connectedBody: 'Your flag is wired up. Finish setup to close this dialog.',
    waitingTitle: 'Listening for the first evaluation…',
    waitingBody: 'Run your app and evaluate your flag.',
};

export const Default: Story = () => (
    <Container>
        <Section>
            <Typography variant='subtitle2'>ConfigureSdk — waiting</Typography>
            <SdkConnectionStatus sdkConnected={false} {...configureProps} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                ConfigureSdk — waiting with troubleshooting
            </Typography>
            <SdkConnectionStatus
                sdkConnected={false}
                showTroubleshooting
                troubleshootingText='Not seeing evaluations after ~30s? Make sure your app has started and that the client was initialized with the API key from step 2.'
                {...configureProps}
            />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                ConfigureSdk — connected
            </Typography>
            <SdkConnectionStatus sdkConnected={true} {...configureProps} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                ImplementFlagDialog — waiting
            </Typography>
            <SdkConnectionStatus sdkConnected={false} {...implementProps} />
        </Section>
        <Section>
            <Typography variant='subtitle2'>
                ImplementFlagDialog — evaluated
            </Typography>
            <SdkConnectionStatus sdkConnected={true} {...implementProps} />
        </Section>
    </Container>
);
