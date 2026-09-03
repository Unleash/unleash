import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { Tracking } from 'utils/trackingEvents';
import { useTracking } from 'hooks/useTracking';

interface IFeatureStaleDialogProps {
    isStale: boolean;
    isOpen: boolean;
    projectId: string;
    featureId: string;
    onClose: () => void;
    onSuccess?: () => void;
    tracking?: Tracking;
}

export const FeatureStaleDialog = ({
    isStale,
    isOpen,
    projectId,
    featureId,
    onClose,
    onSuccess,
    tracking,
}: IFeatureStaleDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { patchFeatureToggle, loading } = useFeatureApi();
    const { trackMutation } = useTracking(tracking);

    const flagToStaleContent = (
        <Typography>Setting a flag to stale marks it for cleanup</Typography>
    );

    const flagToActiveContent = (
        <Typography>
            Setting a flag to active marks it as in active use
        </Typography>
    );

    const flagActionText = isStale ? 'active' : 'stale';

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.stopPropagation();

        try {
            const patch = [{ op: 'replace', path: '/stale', value: !isStale }];
            await trackMutation(() =>
                patchFeatureToggle(projectId, featureId, patch),
            );
            setToastData({
                type: 'success',
                text: isStale
                    ? 'The flag is no longer marked as stale'
                    : 'The flag has been marked as stale',
            });
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            setToastApiError(formatUnknownError(err));
        }
    };

    return (
        <Dialogue
            open={isOpen}
            secondaryButtonText={'Cancel'}
            primaryButtonText={`Flip to ${flagActionText}`}
            title={`Set feature state to ${flagActionText}`}
            onClick={onSubmit}
            onClose={onClose}
            disabledPrimaryButton={loading}
            tracking={tracking}
        >
            <ConditionallyRender
                condition={isStale}
                show={flagToActiveContent}
                elseShow={flagToStaleContent}
            />
        </Dialogue>
    );
};
