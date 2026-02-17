import { useState } from 'react';
import {
    Button,
    IconButton,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useProjectJsonSchemas } from 'hooks/api/getters/useProjectJsonSchemas/useProjectJsonSchemas';
import { useProjectJsonSchemasApi } from 'hooks/api/actions/useProjectJsonSchemasApi/useProjectJsonSchemasApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ProjectJsonSchemaModal } from './ProjectJsonSchemaModal';
import { ProjectJsonSchemaDeleteDialog } from './ProjectJsonSchemaDeleteDialog';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import type { IProjectJsonSchema } from 'interfaces/jsonSchema';

const StyledTableCell = styled(TableCell)({
    padding: '12px 16px',
});

export const ProjectJsonSchemas = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { jsonSchemas, refetch, loading } = useProjectJsonSchemas(projectId);
    const {
        createJsonSchema,
        updateJsonSchema,
        deleteJsonSchema,
        loading: apiLoading,
    } = useProjectJsonSchemasApi();
    const { setToastData, setToastApiError } = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedSchema, setSelectedSchema] = useState<
        IProjectJsonSchema | undefined
    >();

    usePageTitle(`Project JSON schemas – ${projectName}`);

    const onEdit = (schema: IProjectJsonSchema) => {
        setSelectedSchema(schema);
        setModalOpen(true);
    };

    const onCreate = () => {
        setSelectedSchema(undefined);
        setModalOpen(true);
    };

    const onDelete = (schema: IProjectJsonSchema) => {
        setSelectedSchema(schema);
        setDeleteOpen(true);
    };

    const handleSubmit = async (payload: { name: string; schema: object }) => {
        try {
            if (selectedSchema) {
                await updateJsonSchema(projectId, selectedSchema.id, payload);
                setToastData({
                    type: 'success',
                    text: 'JSON schema updated',
                });
            } else {
                await createJsonSchema(projectId, payload);
                setToastData({
                    type: 'success',
                    text: 'JSON schema created',
                });
            }
            setModalOpen(false);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleDeleteConfirm = async (schema: IProjectJsonSchema) => {
        try {
            await deleteJsonSchema(projectId, schema.id);
            setToastData({
                type: 'success',
                text: `"${schema.name}" has been deleted`,
            });
            setDeleteOpen(false);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        title={`JSON schemas (${jsonSchemas.length})`}
                        actions={
                            <Button
                                variant='contained'
                                color='primary'
                                startIcon={<Add />}
                                onClick={onCreate}
                            >
                                New JSON schema
                            </Button>
                        }
                    />
                }
            >
                {jsonSchemas.length === 0 ? (
                    <Typography color='text.secondary'>
                        No JSON schemas defined for this project yet. Create one
                        to validate strategy variant JSON payloads.
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>Created</StyledTableCell>
                                <StyledTableCell align='right'>
                                    Actions
                                </StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jsonSchemas.map((schema) => (
                                <TableRow key={schema.id} hover>
                                    <StyledTableCell>
                                        {schema.name}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TimeAgo date={schema.createdAt} />
                                    </StyledTableCell>
                                    <StyledTableCell align='right'>
                                        <Tooltip title='Edit' arrow>
                                            <IconButton
                                                onClick={() => onEdit(schema)}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Delete' arrow>
                                            <IconButton
                                                onClick={() => onDelete(schema)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </StyledTableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </PageContent>

            <SidebarModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                label={
                    selectedSchema ? 'Edit JSON schema' : 'Create JSON schema'
                }
            >
                <ProjectJsonSchemaModal
                    editSchema={selectedSchema}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                    loading={apiLoading}
                />
            </SidebarModal>

            <ProjectJsonSchemaDeleteDialog
                schema={selectedSchema}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
};
