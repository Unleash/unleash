import { Dialogue } from 'component/common/Dialogue/Dialogue.tsx';
import { Button } from '@mui/material';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema.ts';
import type { SafeguardType } from './SafeguardForm.tsx';

interface ISafeguardChangeRequestDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    safeguardData: CreateSafeguardSchema;
    environment: string;
    mode: 'create' | 'edit';
    safeguardType?: SafeguardType;
}

export const SafeguardChangeRequestDialog = ({
    isOpen,
    onConfirm,
    onClose,
    safeguardData,
    mode,
    safeguardType,
}: ISafeguardChangeRequestDialogProps) => {
    const { impactMetric } = safeguardData;
    const { metricName } = impactMetric;
    const actionLabel =
        safeguardType === 'featureEnvironment'
            ? 'disables the environment'
            : 'pauses automation';

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
                {mode === 'create' ? 'Add' : 'Update'} safeguard that{' '}
                {actionLabel} based on <strong>{metricName}</strong>
            </p>
        </Dialogue>
    );
};
