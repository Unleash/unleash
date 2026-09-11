import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useEffect } from 'react';
import type { ProjectLinkTemplateSchema } from 'openapi';
import { useTracking } from 'hooks/useTracking';
import { dismissMethodFromCloseReason } from 'utils/trackingEvents';
import ProjectLinkTemplateEditor from './ProjectLinkTemplateEditor.tsx';
import {
    linkTemplateAddedTracking,
    linkTemplateEditedTracking,
} from './projectLinkTemplateTracking.ts';

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
}: IProjectLinkTemplateDialogProps) => {
    const trackLinkTemplate = useTracking(
        isAdding ? linkTemplateAddedTracking : linkTemplateEditedTracking,
    );

    useEffect(() => {
        if (open) {
            trackLinkTemplate('opened');
        }
    }, [open, trackLinkTemplate]);

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                trackLinkTemplate('dismissed', {
                    method: dismissMethodFromCloseReason(reason),
                });
                onCancel();
            }}
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
                    onSave={(saved) => {
                        trackLinkTemplate('submitted');
                        onSave(saved);
                    }}
                    onValidationFailed={trackLinkTemplate.validationFailed}
                    onCancel={() => {
                        trackLinkTemplate('dismissed', {
                            method: 'cancel-button',
                        });
                        onCancel();
                    }}
                    isAdding={isAdding}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ProjectLinkTemplateDialog;
