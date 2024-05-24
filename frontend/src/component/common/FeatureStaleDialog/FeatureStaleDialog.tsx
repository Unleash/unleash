import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IFeatureStaleDialogProps {
    isStale: boolean;
    isOpen: boolean;
    projectId: string;
    featureId: string;
    onClose: () => void;
}

export const FeatureStaleDialog = ({
    isStale,
    isOpen,
    projectId,
    featureId,
    onClose,
}: IFeatureStaleDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { patchFeatureToggle } = useFeatureApi();

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
            await patchFeatureToggle(projectId, featureId, patch);
            onClose();
        } catch (err: unknown) {
            setToastApiError(formatUnknownError(err));
        }

        if (isStale) {
            setToastData({
                type: 'success',
                title: "And we're back!",
                text: 'The flag is no longer marked as stale.',
            });
        } else {
            setToastData({
                type: 'success',
                title: 'A job well done.',
                text: 'The flag has been marked as stale.',
            });
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
        >
            <ConditionallyRender
                condition={isStale}
                show={flagToActiveContent}
                elseShow={flagToStaleContent}
            />
        </Dialogue>
    );
};
