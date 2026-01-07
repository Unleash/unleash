import { useState, type Dispatch, type SetStateAction } from 'react';
import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { ProjectLinkTemplateSchema } from 'openapi';
import ProjectLinkTemplateDialog from './ProjectLinkTemplateDialog.tsx';
import { Truncator } from 'component/common/Truncator/Truncator';

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
    gap: theme.spacing(2),
}));

const StyledLinkTemplatesList = styled(List)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: 0,
}));

const StyledLinkTemplateItem = styled(ListItem)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
    borderRight: 0,
}));

const ProjectLinkTemplates = ({
    linkTemplates = [],
    setLinkTemplates,
}: IProjectLinkTemplatesProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTemplateIndex, setEditingTemplateIndex] = useState<
        number | null
    >(null);

    const handleEditTemplate = (index: number) => {
        setEditingTemplateIndex(index);
        setIsAdding(false);
        setDialogOpen(true);
    };

    const handleSaveTemplate = (template: ProjectLinkTemplateSchema) => {
        if (editingTemplateIndex !== null) {
            const updatedTemplates = [...linkTemplates];
            updatedTemplates[editingTemplateIndex] = template;
            setLinkTemplates?.(updatedTemplates);
        } else {
            setLinkTemplates?.([...linkTemplates, template]);
        }
        handleCancelEdit();
    };

    const handleCancelEdit = () => {
        setEditingTemplateIndex(null);
        setIsAdding(false);
        setDialogOpen(false);
    };

    const handleDeleteTemplate = (index: number) => {
        const updatedTemplates = [...linkTemplates];
        updatedTemplates.splice(index, 1);
        setLinkTemplates?.(updatedTemplates);
    };

    return (
        <StyledLinkTemplatesContainer>
            <Box display='flex' alignItems='center' gap={1}>
                <Typography variant='h4'>Project Link Templates</Typography>
                <Tooltip
                    title={
                        <Box
                            sx={(theme) => ({
                                fontWeight: theme.typography.body1.fontWeight,
                            })}
                        >
                            <p>
                                Link templates can be automatically added to new
                                feature flags. They can include placeholders
                                like <code>{`{{project}}`}</code> and
                                <code>{`{{feature}}`}</code> that will be
                                replaced with actual values.
                            </p>
                        </Box>
                    }
                >
                    <IconButton size='small' sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </Box>
            <StyledSubtitle>
                <p>
                    Define link templates that can be automatically added to new
                    feature flags in this project.
                </p>
            </StyledSubtitle>

            {linkTemplates.length > 0 ? (
                <StyledLinkTemplatesList>
                    {linkTemplates.map((template, index) => {
                        return (
                            <StyledLinkTemplateItem key={index}>
                                <ListItemText
                                    primary={
                                        template.title ? (
                                            <Truncator>
                                                {template.title}
                                            </Truncator>
                                        ) : null
                                    }
                                    secondary={
                                        <Truncator>
                                            {template.urlTemplate}
                                        </Truncator>
                                    }
                                />
                                <Box
                                    sx={(theme) => ({
                                        display: 'flex',
                                        marginRight: theme.spacing(-1),
                                    })}
                                >
                                    <IconButton
                                        edge='end'
                                        aria-label='edit'
                                        onClick={() =>
                                            handleEditTemplate(index)
                                        }
                                        sx={{ margin: 0 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='delete'
                                        onClick={() =>
                                            handleDeleteTemplate(index)
                                        }
                                        sx={{ margin: 0 }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </StyledLinkTemplateItem>
                        );
                    })}
                </StyledLinkTemplatesList>
            ) : null}

            <ProjectLinkTemplateDialog
                open={dialogOpen}
                onSave={handleSaveTemplate}
                onCancel={handleCancelEdit}
                isAdding={isAdding}
                template={
                    editingTemplateIndex !== null
                        ? linkTemplates[editingTemplateIndex]
                        : undefined
                }
            />

            <Box display='flex' justifyContent='flex-start'>
                <Button
                    startIcon={<AddIcon />}
                    variant='outlined'
                    onClick={() => {
                        setIsAdding(true);
                        setDialogOpen(true);
                    }}
                >
                    Add link template
                </Button>
            </Box>
        </StyledLinkTemplatesContainer>
    );
};

export default ProjectLinkTemplates;
