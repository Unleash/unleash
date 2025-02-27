import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlan } from './ReleasePlan';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';

interface IReleasePlanAddDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
    template?: IReleasePlanTemplate;
    featureName: string;
    environment: string;
}

export const ReleasePlanAddDialog = ({
    open,
    setOpen,
    onConfirm,
    template,
    featureName,
    environment,
}: IReleasePlanAddDialogProps) => {
    if (!template) return;

    const planPreview = useReleasePlanPreview(
        template.id,
        featureName,
        environment,
    );

    return (
        <Dialogue
            title='Add release plan?'
            open={open}
            primaryButtonText='Add release plan'
            secondaryButtonText='Cancel'
            onClick={onConfirm}
            onClose={() => setOpen(false)}
        >
            <ReleasePlan plan={planPreview} readonly />
        </Dialogue>
    );
};
