import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

interface ITemplateDeleteDialogProps {
    template?: IReleasePlanTemplate;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (template: IReleasePlanTemplate) => void;
}

export const TemplateDeleteDialog: React.FC<ITemplateDeleteDialogProps> = ({
    template,
    open,
    setOpen,
    onConfirm,
}) => {
    return (
        <Dialogue
            title='Delete release plan template?'
            open={open}
            primaryButtonText='Delete template'
            secondaryButtonText='Cancel'
            onClick={() => onConfirm(template!)}
            onClose={() => {
                setOpen(false);
            }}
        >
            <p>
                You are about to delete release plan template:{' '}
                <strong>{template?.name}</strong>
            </p>
        </Dialogue>
    );
};
