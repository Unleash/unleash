import { FC } from 'react';
import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { oneOf } from 'utils/oneOf';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IChangeRequestDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    environment?: string;
    showBanner?: boolean;
    messageComponent: JSX.Element;
}

export const ChangeRequestDialogue: FC<IChangeRequestDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    showBanner,
    environment,
    messageComponent,
}) => {
    const { projectId } = useRequiredPathParam('projectId');
    const { draft } = usePendingChangeRequests(projectId);

    if (!draft) return null;

    const hasChangeRequestInReviewForEnvironment = draft.some(
        changeRequest =>
            changeRequest.environment === environment &&
            oneOf(['In review', 'Approved'], changeRequest.state)
    );

    return (
        <Dialogue
            open={isOpen}
            primaryButtonText="Add suggestion to draft"
            secondaryButtonText="Cancel"
            onClick={onConfirm}
            onClose={onClose}
            title="Request changes"
            fullWidth
        >
            <ConditionallyRender
                condition={hasChangeRequestInReviewForEnvironment}
                show={<Alert>Hello world</Alert>}
            />
            <ConditionallyRender
                condition={Boolean(showBanner)}
                show={
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Change requests feature is enabled for {environment}.
                        Your changes needs to be approved before they will be
                        live. All the changes you do now will be added into a
                        draft that you can submit for review.
                    </Alert>
                }
            />

            <Typography variant="body2" color="text.secondary">
                Your suggestion:
            </Typography>
            {messageComponent}
        </Dialogue>
    );
};
