import type React from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

interface IReleasePlanConfirmationDialogProps {
    template: IReleasePlanTemplate;
    crProtected: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const ReleasePlanConfirmationDialog = ({
    template,
    crProtected,
    open,
    setOpen,
    onConfirm,
}: IReleasePlanConfirmationDialogProps) => (
    <Dialogue
        title='Replace release plan?'
        open={open}
        primaryButtonText={
            crProtected ? 'Add suggestion to draft' : 'Add release plan'
        }
        secondaryButtonText='Close'
        onClick={onConfirm}
        onClose={() => {
            setOpen(false);
        }}
    >
        This environment currently has a release plan added. Do you want to
        replace it with <strong>{template.name}</strong>?
    </Dialogue>
);
