import { useMemo, useState, VFC } from "react";
import { HeaderGroup, useGlobalFilter, useTable } from "react-table";
import { Alert, Box, Typography } from "@mui/material";
import { SortableTableHeader, Table, TableBody, TableCell, TableRow } from "component/common/Table";
import { sortTypes } from "utils/sortTypes";
import { PageContent } from "component/common/PageContent/PageContent";
import { PageHeader } from "component/common/PageHeader/PageHeader";
import { TextCell } from "component/common/Table/cells/TextCell/TextCell";
import PermissionSwitch from "component/common/PermissionSwitch/PermissionSwitch";
import { useRequiredPathParam } from "hooks/useRequiredPathParam";
import { Dialogue } from "component/common/Dialogue/Dialogue";
import { ConditionallyRender } from "component/common/ConditionallyRender/ConditionallyRender";
import { useChangeRequestConfig } from "../../../../../hooks/api/getters/useChangeRequestConfig/useChangeRequestConfig";
import { useChangeRequestApi } from "../../../../../hooks/api/actions/useChangeRequestApi/useChangeRequestApi";
import { UPDATE_PROJECT } from "@server/types/permissions";

export const ChangeRequestConfiguration: VFC = () => {
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        enableEnvironment?: string;
        isEnabled: boolean
    }>({
        isOpen: false,
        enableEnvironment: '',
        isEnabled: false
    });
    const projectId = useRequiredPathParam('projectId');
    const { data, loading, refetchChangeRequestConfig } = useChangeRequestConfig(projectId);
    const { updateChangeRequestEnvironmentConfig } = useChangeRequestApi()

    const onClick = (enableEnvironment: string, isEnabled: boolean) => () => {
        setDialogState({ isOpen: true, enableEnvironment, isEnabled });
    };

    const onConfirm = async () => {
        if (dialogState.enableEnvironment) {
            await updateChangeRequestEnvironmentConfig(projectId, dialogState.enableEnvironment, !dialogState.isEnabled);
            await refetchChangeRequestConfig()
        }
        setDialogState({ isOpen: false, enableEnvironment: '', isEnabled: false});
    }

    const columns = useMemo(
        () => [
            {
                Header: 'Environment',
                accessor: 'environment',
                disableSortBy: true,
            },
            {
                Header: 'Type',
                accessor: 'type',
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: 'Status',
                accessor: 'changeRequestEnabled',
                align: 'center',

                Cell: ({ value, row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        <PermissionSwitch
                            checked={value}
                            environmentId={original.environment}
                            projectId={projectId}
                            permission={UPDATE_PROJECT}
                            inputProps={{ 'aria-label': original.environment }}
                            onClick={onClick(original.environment, original.changeRequestEnabled)}
                        />
                    </Box>
                ),
                width: 100,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns,
                data,
                sortTypes,
                autoResetGlobalFilter: false,
                disableSortRemove: true,
                defaultColumn: {
                    Cell: TextCell,
                },
            },
            useGlobalFilter
        );
    return (
        <PageContent
            header={<PageHeader titleElement="Change request configuration" />}
            isLoading={loading}
        >
            <Alert severity="info" sx={{ mb: 3 }}>
                If change request is enabled for an environment, then any change
                in that environment needs to be approved before it will be
                applied
            </Alert>

            <Table {...getTableProps()}>
                <SortableTableHeader
                    headerGroups={headerGroups as HeaderGroup<object>[]}
                />
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow hover {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <TableCell {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Dialogue
                onClick={() => onConfirm()}
                open={dialogState.isOpen}
                onClose={() =>
                    setDialogState(state => ({ ...state, isOpen: false }))
                }
                primaryButtonText={dialogState.isEnabled ? "Disable" : "Enable"}
                secondaryButtonText="Cancel"
                title={`${ dialogState.isEnabled ? "Disable" : "Enable" } change requests`}
            >
                <Typography sx={{ mb: 1 }}>
                    You are about to {dialogState.isEnabled ? 'disable' : 'enable'} “Change request”
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
                        <Typography variant="body2" color="text.secondary">
                            When enabling change request for an environment, you need to
                            be sure that your Unleash Admin already have created the
                            custom project roles in your Unleash instance so you can
                            assign your project members from the project access page.
                        </Typography>}
                />
            </Dialogue>
        </PageContent>
    );
};
