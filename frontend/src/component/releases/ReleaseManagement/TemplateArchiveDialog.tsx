import { RELEASE_PLAN_TEMPLATE_DELETE } from '@server/types/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

interface ITemplateArchiveDialogProps {
    template?: IReleasePlanTemplate;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (template: IReleasePlanTemplate) => void;
}

export const TemplateArchiveDialog: React.FC<ITemplateArchiveDialogProps> = ({
    template,
    open,
    setOpen,
    onConfirm,
}) => {
    return (
        <Dialogue
            title='Archive release template?'
            open={open}
            secondaryButtonText='Cancel'
            onClose={() => {
                setOpen(false);
            }}
            permissionButton={
                <PermissionButton
                    variant='contained'
                    onClick={() => onConfirm(template!)}
                    permission={RELEASE_PLAN_TEMPLATE_DELETE}
                >
                    Archive template
                </PermissionButton>
            }
        >
            <p>
                You are about to archive release template:{' '}
                <strong>{template?.name}</strong>
            </p>
        </Dialogue>
    );
};
