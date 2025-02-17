import { Alert } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlan } from 'interfaces/releasePlans';

interface IReleasePlanRemoveDialogProps {
    plan: IReleasePlan;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
    environmentActive: boolean;
}

export const ReleasePlanRemoveDialog = ({
    plan,
    open,
    setOpen,
    onConfirm,
    environmentActive,
}: IReleasePlanRemoveDialogProps) => (
    <Dialogue
        title='Remove release plan?'
        open={open}
        primaryButtonText='Remove release plan'
        secondaryButtonText='Cancel'
        onClick={onConfirm}
        onClose={() => setOpen(false)}
    >
        <ConditionallyRender
            condition={Boolean(plan.activeMilestoneId) && environmentActive}
            show={
                <Alert severity='error' sx={{ mb: 2 }}>
                    This release plan currently has one active milestone.
                    Removing the release plan will change which users receive
                    access to the feature.
                </Alert>
            }
        />
        <p>
            You are about to remove release plan <strong>{plan.name}</strong>{' '}
            from <strong>{plan.featureName}</strong> in{' '}
            <strong>{plan.environment}</strong>
        </p>
    </Dialogue>
);
