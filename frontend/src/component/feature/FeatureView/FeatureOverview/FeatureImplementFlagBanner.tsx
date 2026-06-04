import { useState } from 'react';
import { Button } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureFlagSetupBannerCard } from './FeatureFlagSetupBannerCard.tsx';
import { ImplementFlagDialog } from './ImplementFlagDialog/ImplementFlagDialog.tsx';

interface FeatureImplementFlagBannerProps {
    projectId: string;
    featureId: string;
    onComplete: () => void;
}

export const FeatureImplementFlagBanner = ({
    projectId,
    featureId,
    onComplete,
}: FeatureImplementFlagBannerProps) => {
    const { trackEvent } = usePlausibleTracker();
    const [dialogOpen, setDialogOpen] = useState(false);

    const onDialogClose = () => {
        setDialogOpen(false);
        onComplete();
    };

    const onImplementClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-implement-clicked' },
        });
        setDialogOpen(true);
    };

    return (
        <>
            <FeatureFlagSetupBannerCard
                title='Implement your flag'
                description='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
            >
                <Button variant='contained' onClick={onImplementClick}>
                    Wrap your code
                </Button>
            </FeatureFlagSetupBannerCard>
            <ImplementFlagDialog
                open={dialogOpen}
                onClose={onDialogClose}
                projectId={projectId}
                feature={featureId}
            />
        </>
    );
};
