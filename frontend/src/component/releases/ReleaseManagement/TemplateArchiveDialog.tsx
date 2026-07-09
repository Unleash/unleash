import {
    RELEASE_PLAN_TEMPLATE_DELETE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

interface ITemplateArchiveDialogProps {
    template?: IReleasePlanTemplate;
    projectId?: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (template: IReleasePlanTemplate) => void;
}

export const TemplateArchiveDialog: React.FC<ITemplateArchiveDialogProps> = ({
    template,
    projectId,
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
                    permission={[
                        RELEASE_PLAN_TEMPLATE_DELETE,
                        UPDATE_PROJECT_RELEASE_TEMPLATE,
                    ]}
                    projectId={projectId}
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
