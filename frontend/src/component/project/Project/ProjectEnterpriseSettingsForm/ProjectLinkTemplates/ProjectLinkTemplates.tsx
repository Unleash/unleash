import { useState, type Dispatch, type SetStateAction } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemText, styled, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { ProjectLinkTemplateSchema } from 'openapi';

interface IProjectLinkTemplatesProps {
    linkTemplates: ProjectLinkTemplateSchema[];
    setLinkTemplates?: Dispatch<SetStateAction<ProjectLinkTemplateSchema[]>>;
}

const StyledSubtitle = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.25,
    paddingBottom: theme.spacing(1),
}));

const StyledLinkTemplatesContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledLinkTemplatesList = styled(List)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const StyledLinkTemplateItem = styled(ListItem)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const StyledDialogContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
}));

const ProjectLinkTemplates = ({
    linkTemplates = [],
    setLinkTemplates,
}: IProjectLinkTemplatesProps) => {

    // Link template form state
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [editingTemplateIndex, setEditingTemplateIndex] = useState<number | null>(null);
    const [templateTitle, setTemplateTitle] = useState('');
    const [templateUrl, setTemplateUrl] = useState('');
    const [templateErrors, setTemplateErrors] = useState<{title?: string, url?: string}>({});

    const resetTemplateForm = () => {
        setTemplateTitle('');
        setTemplateUrl('');
        setTemplateErrors({});
        setIsAddingTemplate(false);
        setIsEditingTemplate(false);
        setEditingTemplateIndex(null);
    };

    const validateTemplateForm = () => {
        const errors: {title?: string, url?: string} = {};
        
        if (!templateUrl) {
            errors.url = 'URL template is required';
        }

        setTemplateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddTemplate = () => {
        if (validateTemplateForm()) {
            const newTemplate: ProjectLinkTemplateSchema = {
                title: templateTitle || null,
                urlTemplate: templateUrl,
            };
            setLinkTemplates?.([...linkTemplates, newTemplate]);
            resetTemplateForm();
        }
    };

    const handleEditTemplate = (index: number) => {
        setIsEditingTemplate(true);
        setEditingTemplateIndex(index);
        setTemplateTitle(linkTemplates[index].title || '');
        setTemplateUrl(linkTemplates[index].urlTemplate);
    };

    const handleUpdateTemplate = () => {
        if (validateTemplateForm() && editingTemplateIndex !== null) {
            const updatedTemplates = [...linkTemplates];
            updatedTemplates[editingTemplateIndex] = {
                title: templateTitle || null,
                urlTemplate: templateUrl,
            };
            setLinkTemplates?.(updatedTemplates);
            resetTemplateForm();
        }
    };

    const handleDeleteTemplate = (index: number) => {
        const updatedTemplates = [...linkTemplates];
        updatedTemplates.splice(index, 1);
        setLinkTemplates?.(updatedTemplates);
    };

    return (
        <StyledLinkTemplatesContainer>
            <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h4">Project Link Templates</Typography>
                <Tooltip title="Link templates can be automatically added to new feature flags. They can include placeholders like {{project}} and {{feature}} that will be replaced with actual values.">
                    <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <StyledSubtitle>
                <p>
                    Define link templates that can be automatically added to new feature flags in this project.
                    Use placeholders <code>&#123;&#123;project&#125;&#125;</code> and <code>&#123;&#123;feature&#125;&#125;</code> in the URL that will be replaced with the project and feature names.
                </p>
            </StyledSubtitle>

            {linkTemplates.length > 0 ? (
                <StyledLinkTemplatesList>
                    {linkTemplates.map((template, index) => (
                        <StyledLinkTemplateItem
                            key={index}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditTemplate(index)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTemplate(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            }
                        >
                            <ListItemText
                                primary={template.title || 'Untitled link'}
                                secondary={template.urlTemplate}
                            />
                        </StyledLinkTemplateItem>
                    ))}
                </StyledLinkTemplatesList>
            ) : (
                <Box py={2}>
                    <Typography variant="body2" color="textSecondary">
                        No link templates defined yet. Add your first template below.
                    </Typography>
                </Box>
            )}

            {isAddingTemplate || isEditingTemplate ? (
                <StyledDialogContent>
                    <Typography variant="h5">
                        {isAddingTemplate ? 'Add new link template' : 'Edit link template'}
                    </Typography>
                    <TextField
                        label="Title (optional)"
                        fullWidth
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        placeholder="e.g., Jira Ticket"
                        helperText="A descriptive name for the link"
                    />
                    <TextField
                        label="URL Template"
                        fullWidth
                        required
                        value={templateUrl}
                        onChange={(e) => setTemplateUrl(e.target.value)}
                        placeholder="https://jira.example.com/browse/{{project}}-{{feature}}"
                        helperText={templateErrors.url || "You can optionally use placeholders {{project}} and {{feature}} that will be replaced with actual values"}
                        error={Boolean(templateErrors.url)}
                    />
                    <StyledDialogActions>
                        <Button variant="outlined" onClick={resetTemplateForm}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={isAddingTemplate ? handleAddTemplate : handleUpdateTemplate}
                        >
                            {isAddingTemplate ? 'Add' : 'Update'}
                        </Button>
                    </StyledDialogActions>
                </StyledDialogContent>
            ) : (
                <Button 
                    startIcon={<AddIcon />} 
                    variant="outlined" 
                    onClick={() => setIsAddingTemplate(true)}
                >
                    Add link template
                </Button>
            )}
        </StyledLinkTemplatesContainer>
    );
};

export default ProjectLinkTemplates;
