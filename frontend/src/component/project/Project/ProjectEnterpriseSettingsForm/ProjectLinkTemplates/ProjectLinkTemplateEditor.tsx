import { useState } from 'react';
import { Button, styled, TextField } from '@mui/material';
import type { ProjectLinkTemplateSchema } from 'openapi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IProjectLinkTemplateEditorProps {
    template?: ProjectLinkTemplateSchema;
    onSave: (template: ProjectLinkTemplateSchema) => void;
    onCancel: () => void;
    isAdding: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

const StyledDialogActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),
}));

const ProjectLinkTemplateEditor = ({
    template,
    onSave,
    onCancel,
    isAdding,
}: IProjectLinkTemplateEditorProps) => {
    const [templateTitle, setTemplateTitle] = useState(template?.title || '');
    const [templateUrl, setTemplateUrl] = useState(template?.urlTemplate || '');
    const [templateErrors, setTemplateErrors] = useState<{
        title?: string;
        url?: string;
    }>({});
    const { trackEvent } = usePlausibleTracker();

    const validateTemplateForm = () => {
        const errors: { title?: string; url?: string } = {};

        if (!templateUrl) {
            errors.url = 'URL template is required';
        }

        setTemplateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (validateTemplateForm()) {
            trackEvent('feature-links', {
                props: {
                    eventType: isAdding ? 'add-template' : 'edit-template',
                },
            });
            onSave({
                title: templateTitle || null,
                urlTemplate: templateUrl,
            });
        }
    };

    return (
        <StyledContainer>
            <TextField
                label='Title (optional)'
                fullWidth
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder='e.g., GitHub Issue, Ticket number'
                helperText='A descriptive name for the link.'
                size='small'
            />
            <TextField
                label='URL Template'
                fullWidth
                required
                value={templateUrl}
                onChange={(e) => setTemplateUrl(e.target.value)}
                placeholder='https://github.com/{{project}}/{{feature}}'
                helperText={
                    templateErrors.url ||
                    'You can optionally use placeholders {{project}} and {{feature}} that will be replaced with actual values.'
                }
                size='small'
                error={Boolean(templateErrors.url)}
            />
            <StyledDialogActions>
                <Button variant='outlined' onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSave}
                >
                    {isAdding ? 'Add' : 'Update'}
                </Button>
            </StyledDialogActions>
        </StyledContainer>
    );
};

export default ProjectLinkTemplateEditor;
