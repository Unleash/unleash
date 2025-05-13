import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import type { ProjectLinkTemplateSchema } from 'openapi';
import ProjectLinkTemplateEditor from './ProjectLinkTemplateEditor.tsx';

interface IProjectLinkTemplateDialogProps {
    template?: ProjectLinkTemplateSchema;
    open: boolean;
    onSave: (template: ProjectLinkTemplateSchema) => void;
    onCancel: () => void;
    isAdding: boolean;
}

const ProjectLinkTemplateDialog = ({
    template,
    open,
    onSave,
    onCancel,
    isAdding,
}: IProjectLinkTemplateDialogProps) => (
    <Dialog
        open={open}
        onClose={onCancel}
        maxWidth='sm'
        fullWidth
        aria-labelledby='dialog-link-template'
    >
        <DialogTitle id='dialog-link-template'>
            {isAdding ? 'Add new link template' : 'Edit link template'}
        </DialogTitle>
        <DialogContent>
            <ProjectLinkTemplateEditor
                template={template}
                onSave={onSave}
                onCancel={onCancel}
                isAdding={isAdding}
            />
        </DialogContent>
    </Dialog>
);

export default ProjectLinkTemplateDialog;
