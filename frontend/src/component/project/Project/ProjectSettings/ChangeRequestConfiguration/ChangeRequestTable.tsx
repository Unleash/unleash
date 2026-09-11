import { type FC, useContext, useMemo, useState } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Alert, Box, styled, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestConfig } from 'hooks/api/getters/useChangeRequestConfig/useChangeRequestConfig';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { UPDATE_PROJECT } from '@server/types/permissions';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ChangeRequestProcessHelp } from './ChangeRequestProcessHelp/ChangeRequestProcessHelp.tsx';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useTheme } from '@mui/material/styles';
import AccessContext from 'contexts/AccessContext';
import { useTracking } from 'hooks/useTracking';
import {
    changeRequestToggledTracking,
    requiredApprovalsChangedTracking,
} from 'component/changeRequest/changeRequestTracking';
import { PROJECT_CHANGE_REQUEST_WRITE } from '../../../../providers/AccessProvider/permissions.ts';
import type { IChangeRequestEnvironmentConfig as IChangeRequestRow } from 'component/changeRequest/changeRequest.types';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInputBase-input': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

export const ChangeRequestTable: FC = () => {
    const { hasAccess } = useContext(AccessContext);
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        enableEnvironment: string;
        environmentType: string;
        isEnabled: boolean;
        requiredApprovals: number;
    }>({
        isOpen: false,
        enableEnvironment: '',
        environmentType: '',
        isEnabled: false,
        requiredApprovals: 1,
    });

    const theme = useTheme();
    const projectId = useRequiredPathParam('projectId');
    const { data, loading, refetchChangeRequestConfig } =
        useChangeRequestConfig(projectId);
    const { updateChangeRequestEnvironmentConfig } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    const onRowChange = (row: IChangeRequestRow) => () => {
        setDialogState({
            isOpen: true,
            enableEnvironment: row.environment,
            environmentType: row.type,
            isEnabled: row.changeRequestEnabled,
            requiredApprovals: row.requiredApprovals,
        });
    };

    const trackRequiredApprovalsChanged = useTracking(
        requiredApprovalsChangedTracking,
    );

    const onConfirm = async () => {
        await updateChangeRequestEnvironmentConfig({
            project: projectId,
            environment: dialogState.enableEnvironment,
            enabled: !dialogState.isEnabled,
            requiredApprovals: dialogState.requiredApprovals,
        });
        setDialogState((state) => ({ ...state, isOpen: false }));
        setToastData({
            type: 'success',
            text: 'Change request status updated',
        });
        await refetchChangeRequestConfig();
    };

    const approvalOptions = Array.from(Array(10).keys())
        .map((key) => String(key + 1))
        .map((key) => {
            const labelText = key === '1' ? 'approval' : 'approvals';
            return {
                key,
                label: `${key} ${labelText}`,
                sx: { fontSize: theme.fontSizes.smallBody },
            };
        });

    async function onRequiredApprovalsChange(
        original: IChangeRequestRow,
        approvals: string,
    ) {
        const requiredApprovals = Number(approvals);
        try {
            await trackRequiredApprovalsChanged.mutation(
                () =>
                    updateChangeRequestEnvironmentConfig({
                        project: projectId,
                        environment: original.environment,
                        enabled: original.changeRequestEnabled,
                        requiredApprovals,
                    }),
                { requiredApprovals },
            );
            setToastData({
                type: 'success',
                text: 'Change request status updated',
            });
            await refetchChangeRequestConfig();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    }

    const columns = useMemo<ColumnDef<IChangeRequestRow, unknown>[]>(
        () => [
            {
                id: 'environment',
                header: 'Environment',
                accessorKey: 'environment',
                enableSorting: false,
            },
            {
                id: 'type',
                header: 'Type',
                accessorKey: 'type',
                enableSorting: false,
            },
            {
                id: 'requiredApprovals',
                header: 'Required approvals',
                cell: ({ row: { original } }) =>
                    original.changeRequestEnabled ? (
                        <StyledBox data-loading>
                            <GeneralSelect
                                sx={{ width: '140px', marginLeft: 1 }}
                                options={approvalOptions}
                                value={String(original.requiredApprovals || 1)}
                                onChange={(approvals) => {
                                    onRequiredApprovalsChange(
                                        original,
                                        approvals,
                                    );
                                }}
                                disabled={
                                    !hasAccess(
                                        [
                                            UPDATE_PROJECT,
                                            PROJECT_CHANGE_REQUEST_WRITE,
                                        ],
                                        projectId,
                                    )
                                }
                                IconComponent={KeyboardArrowDownOutlined}
                                fullWidth
                            />
                        </StyledBox>
                    ) : null,
                enableSorting: false,
            },
            {
                id: 'changeRequestEnabled',
                header: 'Status',
                accessorKey: 'changeRequestEnabled',
                cell: ({ getValue, row: { original } }) => (
                    <StyledBox data-loading>
                        <PermissionSwitch
                            checked={Boolean(getValue())}
                            projectId={projectId}
                            permission={[
                                UPDATE_PROJECT,
                                PROJECT_CHANGE_REQUEST_WRITE,
                            ]}
                            slotProps={{
                                input: { 'aria-label': original.environment },
                            }}
                            onClick={onRowChange(original)}
                        />
                    </StyledBox>
                ),
                enableSorting: false,
                meta: { align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [projectId],
    );

    const table = useReactTable({
        columns,
        data,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return (
        <PageContent
            header={
                <PageHeader
                    titleElement='Change request configuration'
                    actions={<ChangeRequestProcessHelp />}
                />
            }
            isLoading={loading}
        >
            <Alert severity='info' sx={{ mb: 3 }}>
                If change request is enabled for an environment, then any change
                in that environment needs to be approved before it will be
                applied
            </Alert>
            <Table>
                <SortableTableHeader tableInstance={table} />
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow hover key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialogue
                onSubmit={onConfirm}
                onError={(error) => setToastApiError(formatUnknownError(error))}
                open={dialogState.isOpen}
                onClose={() =>
                    setDialogState((state) => ({ ...state, isOpen: false }))
                }
                tracking={changeRequestToggledTracking({
                    newState: dialogState.isEnabled ? 'disabled' : 'enabled',
                    environmentType: dialogState.environmentType,
                })}
                primaryButtonText={dialogState.isEnabled ? 'Disable' : 'Enable'}
                secondaryButtonText='Cancel'
                title={`${
                    dialogState.isEnabled ? 'Disable' : 'Enable'
                } change requests`}
            >
                <Typography sx={{ mb: 1 }}>
                    You are about to{' '}
                    {dialogState.isEnabled ? 'disable' : 'enable'} “Change
                    request”
                    <ConditionallyRender
                        condition={Boolean(dialogState.enableEnvironment)}
                        show={
                            <>
                                {' '}
                                for{' '}
                                <strong>{dialogState.enableEnvironment}</strong>
                            </>
                        }
                    />
                    .
                </Typography>
                <ConditionallyRender
                    condition={!dialogState.isEnabled}
                    show={
                        <Typography
                            variant='body2'
                            sx={{
                                color: 'text.secondary',
                            }}
                        >
                            To enable change requests for an environment, you
                            need to ensure that your Unleash Admin has created
                            the necessary custom project roles in your Unleash
                            instance. This will allow you to assign project
                            members from the project access page.
                        </Typography>
                    }
                />
            </Dialogue>
        </PageContent>
    );
};
