import { Dialogue } from '../../../../../common/Dialogue/Dialogue.tsx';
import { Button } from '@mui/material';
import type { CreateSafeguardSchema } from '../../../../../../openapi/models/createSafeguardSchema.ts';

interface ISafeguardChangeRequestDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    safeguardData: CreateSafeguardSchema;
    environment: string;
    mode: 'create' | 'edit';
}

export const SafeguardChangeRequestDialog = ({
    isOpen,
    onConfirm,
    onClose,
    safeguardData,
    mode,
}: ISafeguardChangeRequestDialogProps) => {
    const { impactMetric } = safeguardData;
    const { metricName } = impactMetric;

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
                {mode === 'create' ? 'Add' : 'Update'} safeguard that pauses
                automation based on <strong>{metricName}</strong>
            </p>
        </Dialogue>
    );
};
