import { useState } from 'react';
import { styled } from '@mui/material';
import CodeBlockIcon from 'assets/icons/code-block.svg?react';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useEventTracker } from 'hooks/useEventTracker';
import { FeatureSetupGuideBanner } from './FeatureSetupGuideBanner/FeatureSetupGuideBanner.tsx';
import { ConnectionPulse } from 'component/common/ConnectionPulse/ConnectionPulse.tsx';
import { PendingBadge } from 'component/common/PendingBadge/PendingBadge.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    UPDATE_PROJECT,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';

const StyledActions = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledPermissionButton = styled(PermissionButton)({
    '& svg path': { fill: 'currentColor' },
});

interface FeatureConnectSdkBannerProps {
    projectId: string;
    featureId: string;
    environments: string[];
    onComplete: () => void;
}

export const FeatureConnectSdkBanner = ({
    projectId,
    featureId,
    environments,
    onComplete,
}: FeatureConnectSdkBannerProps) => {
    const { trackEvent } = useEventTracker();
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    const onConnectSdkClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-connect-sdk-clicked' },
        });
        setConnectSdkOpen(true);
    };

    const onDialogClose = () => {
        setConnectSdkOpen(false);
        onComplete();
    };

    return (
        <>
            <FeatureSetupGuideBanner
                variant='set-up-guide'
                icon={<ConnectionPulse />}
                title='Connect SDK'
                subtitle='You must connect an SDK to the project before you can implement this flag in your code.'
                actions={
                    <StyledActions>
                        <StyledPermissionButton
                            variant='contained'
                            startIcon={<CodeBlockIcon />}
                            onClick={onConnectSdkClick}
                            permission={[
                                UPDATE_PROJECT,
                                CREATE_PROJECT_API_TOKEN,
                            ]}
                            projectId={projectId}
                        >
                            Connect SDK
                        </StyledPermissionButton>
                        <PendingBadge />
                    </StyledActions>
                }
            />
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={onDialogClose}
                projectId={projectId}
                environments={environments}
                feature={featureId}
            />
        </>
    );
};
