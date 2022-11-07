import { styled, Alert, TableBody, TableRow } from '@mui/material';
import React from 'react';
import { IEnvironment } from 'interfaces/environments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useTable } from 'react-table';
import { EnvironmentNameCell } from '../../EnvironmentNameCell/EnvironmentNameCell';
import { EnvironmentIconCell } from '../../EnvironmentIconCell/EnvironmentIconCell';
import { SortableTableHeader, Table, TableCell } from 'component/common/Table';

const StyledTable = styled(Table)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const COLUMNS = [
    {
        id: 'Icon',
        width: '1%',
        Cell: ({ row: { original } }: any) => (
            <EnvironmentIconCell environment={original} />
        ),
    },
    {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row: { original } }: any) => (
            <EnvironmentNameCell environment={original} />
        ),
    },
    {
        Header: 'Type',
        accessor: 'type',
    },
];

interface IEnvironmentDeprecateToggleDialogProps {
    environment: IEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const EnvironmentDeprecateToggleDialog = ({
    environment,
    open,
    setOpen,
    onConfirm,
}: IEnvironmentDeprecateToggleDialogProps) => {
    const { enabled } = environment;
    const actionName = enabled ? 'Deprecate' : 'Undeprecate';

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns: COLUMNS as any,
            data: [environment],
            disableSortBy: true,
        });

    return (
        <Dialogue
            title={`${actionName} environment?`}
            open={open}
            primaryButtonText={actionName}
            secondaryButtonText="Close"
            onClick={onConfirm}
            onClose={() => {
                setOpen(false);
            }}
        >
            <ConditionallyRender
                condition={enabled}
                show={
                    <Alert severity="info">
                        Deprecating an environment will mark it as deprecated.
                        Deprecated environments are not set as visible by
                        default for new projects. Project owners are still able
                        to override this setting in the project.
                    </Alert>
                }
                elseShow={
                    <Alert severity="info">
                        Undeprecating an environment will no longer mark it as
                        deprecated. An undeprecated environemt will be set as
                        visibly by default for new projects.
                    </Alert>
                }
            />

            <StyledTable {...getTableProps()} rowHeight="compact">
                <SortableTableHeader headerGroups={headerGroups as any} />
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
            </StyledTable>
        </Dialogue>
    );
};
