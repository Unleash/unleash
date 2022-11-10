import { useMemo, useState, VFC } from 'react';
import { HeaderGroup, Row } from 'react-table';
import { Alert, Box, Typography } from '@mui/material';
import {
    SortableTableHeader,
    Table,
    TableCell,
    TableBody,
    TableRow,
} from 'component/common/Table';
import { useGlobalFilter, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const ChangeRequestConfiguration: VFC = () => {
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        enableEnvironment?: string;
    }>({
        isOpen: false,
        enableEnvironment: '',
    });
    const projectId = useRequiredPathParam('projectId');
    const data = [
        {
            environment: 'dev',
            type: 'test',
            isEnabled: false,
        },
    ] as any[]; // FIXME: type

    const onClick = (enableEnvironment: string) => () => {
        setDialogState({ isOpen: true, enableEnvironment });
    };

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
                accessor: 'isEnabled',
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
                            permission={UPDATE_FEATURE_ENVIRONMENT} // FIXME: permission - enable change request
                            inputProps={{ 'aria-label': original.environment }}
                            onClick={onClick(original.environment)}
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
            // isLoading={loading}
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
                onClick={() => {
                    alert('clicked');
                    /* FIXME: API action */
                }}
                open={dialogState.isOpen}
                onClose={() =>
                    setDialogState(state => ({ ...state, isOpen: false }))
                }
                primaryButtonText="Enable"
                secondaryButtonText="Cancel"
                title="Enable change request"
            >
                <Typography sx={{ mb: 1 }}>
                    You are about to enable “Change request”
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
                <Typography variant="body2" color="text.secondary">
                    When enabling change request for an environment, you need to
                    be sure that your Unleash Admin already have created the
                    custom project roles in your Unleash instance so you can
                    assign your project members from the project access page.
                </Typography>
            </Dialogue>
        </PageContent>
    );
};
