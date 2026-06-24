import { useState } from 'react';
import { Button, styled } from '@mui/material';
import Code from '@mui/icons-material/Code';
import { useEventTracker } from 'hooks/useEventTracker';
import { FeatureSetupGuideBanner } from './FeatureSetupGuideBanner/FeatureSetupGuideBanner.tsx';
import { PendingBadge } from 'component/common/PendingBadge/PendingBadge.tsx';
import { ImplementFlagDialog } from './ImplementFlagDialog/ImplementFlagDialog.tsx';
import { ConnectionPulse } from 'component/common/ConnectionPulse/ConnectionPulse.tsx';

const StyledActions = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

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
    const { trackEvent } = useEventTracker();
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
            <FeatureSetupGuideBanner
                variant='set-up-guide'
                icon={<ConnectionPulse />}
                title='Implement your flag'
                subtitle='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
                actions={
                    <StyledActions>
                        <Button
                            variant='contained'
                            startIcon={<Code />}
                            onClick={onImplementClick}
                        >
                            Wrap your code
                        </Button>
                        <PendingBadge />
                    </StyledActions>
                }
            />
            <ImplementFlagDialog
                open={dialogOpen}
                onClose={onDialogClose}
                projectId={projectId}
                feature={featureId}
            />
        </>
    );
};
