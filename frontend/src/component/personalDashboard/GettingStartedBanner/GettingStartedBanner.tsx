import { useEffect, useState } from 'react';
import { Button, Stack, Tooltip, Typography } from '@mui/material';
import Check from '@mui/icons-material/Check';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useUiFlag } from 'hooks/useUiFlag';
import { useTracking } from 'hooks/useTracking';
import { getSetupPrompt, type SetupPromptContext } from './getSetupPrompt.ts';
import { OnboardingBanner } from '../OnboardingBanner.tsx';
import {
    viewOnboardingWidgetTracking,
    selectOnboardingSetupTracking,
} from '../personalDashboardTracking.ts';

interface GettingStartedBannerProps {
    instanceUrl: string;
    projectId: string;
    promptContext?: SetupPromptContext;
}

export const GettingStartedBanner = ({
    instanceUrl,
    projectId,
    promptContext,
}: GettingStartedBannerProps) => {
    const { setToastData } = useToast();
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) {
            return;
        }
        const timeout = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timeout);
    }, [copied]);
    const trackingProps = {
        widget: 'getting-started',
    };
    const trackView = useTracking({
        ...viewOnboardingWidgetTracking,
        props: trackingProps,
    });
    useEffect(() => {
        trackView('succeeded');
    }, [trackView]);
    const trackSelectSetup = useTracking({
        ...selectOnboardingSetupTracking,
        props: trackingProps,
    });

    const aiSetup = useUiFlag('dashboardOnboardingAI');
    const aiEnabled = typeof aiSetup === 'boolean' ? aiSetup : aiSetup.enabled;

    const copySetupPrompt = () => {
        if (
            copy(getSetupPrompt(instanceUrl, projectId, promptContext, aiSetup))
        ) {
            setCopied(true);
            trackSelectSetup('succeeded', { method: 'ai-prompt' });
            setToastData({
                type: 'success',
                text: 'Setup prompt copied. Paste it into your coding agent.',
            });
        } else {
            setCopied(false);
            trackSelectSetup('failed', {
                method: 'ai-prompt',
                failedOn: 'clipboard',
            });
            setToastData({
                type: 'error',
                text: 'Could not copy the setup prompt. Please try again.',
            });
        }
    };

    return (
        <OnboardingBanner title='Create and connect your first flag'>
            <Typography
                variant='body2'
                color='text.secondary'
                sx={{ maxWidth: '70ch' }}
            >
                {aiEnabled
                    ? 'Let your AI coding agent connect Unleash to your application or build a demo. Copy the prompt and paste it into an agent with access to your local files.'
                    : 'Create your first feature flag and connect it to your application to see changes without redeploying.'}
            </Typography>
            <Stack
                direction='row'
                useFlexGap
                spacing={2}
                sx={{ flexWrap: 'wrap', mt: 1 }}
            >
                {aiEnabled ? (
                    <Tooltip
                        title={copied ? 'Copied!' : ''}
                        open={copied}
                        describeChild
                        arrow
                    >
                        <Button
                            variant='contained'
                            endIcon={
                                copied ? <Check /> : <ContentCopyOutlined />
                            }
                            onClick={copySetupPrompt}
                        >
                            Copy setup prompt
                        </Button>
                    </Tooltip>
                ) : null}
                <Button
                    onClick={() =>
                        trackSelectSetup('succeeded', { method: 'manual' })
                    }
                    component={Link}
                    nativeButton={false}
                    to={`/projects/${encodeURIComponent(projectId)}?create=true`}
                    variant={aiEnabled ? 'outlined' : 'contained'}
                    endIcon={<ArrowForward />}
                >
                    {aiEnabled
                        ? 'Create flag manually'
                        : 'Create your first flag'}
                </Button>
            </Stack>
        </OnboardingBanner>
    );
};
