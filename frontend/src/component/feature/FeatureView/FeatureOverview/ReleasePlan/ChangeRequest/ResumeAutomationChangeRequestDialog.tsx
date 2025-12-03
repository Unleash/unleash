import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Button } from '@mui/material';

interface IResumeAutomationChangeRequestDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    featureId: string;
    environmentId: string;
    releasePlanName: string;
}

export const ResumeAutomationChangeRequestDialog = ({
    isOpen,
    onConfirm,
    onClose,
    featureId,
    environmentId,
    releasePlanName,
}: IResumeAutomationChangeRequestDialogProps) => {
    return (
        <Dialogue
            title='Request changes'
            open={isOpen}
            secondaryButtonText='Cancel'
            onClose={onClose}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={onConfirm}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <p>
                Resume automation paused by safeguard for release plan{' '}
                <strong>{releasePlanName}</strong> for feature{' '}
                <strong>{featureId}</strong> in <strong>{environmentId}</strong>
                .
            </p>
        </Dialogue>
    );
};
