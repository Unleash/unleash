import { styled, Alert, TableBody, TableRow } from '@mui/material';
import React, { useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useTable } from 'react-table';
import { EnvironmentNameCell } from 'component/environments/EnvironmentTable/EnvironmentNameCell/EnvironmentNameCell';
import { EnvironmentIconCell } from 'component/environments/EnvironmentTable/EnvironmentIconCell/EnvironmentIconCell';
import { SortableTableHeader, Table, TableCell } from 'component/common/Table';
import Input from 'component/common/Input/Input';

const StyledTable = styled(Table)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
}));

const StyledInput = styled(Input)(() => ({
    width: '100%',
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

interface IEnvironmentDeleteDialogProps {
    environment: IEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const EnvironmentDeleteDialog = ({
    environment,
    open,
    setOpen,
    onConfirm,
}: IEnvironmentDeleteDialogProps) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns: COLUMNS as any,
            data: [environment],
            disableSortBy: true,
        });

    const [confirmName, setConfirmName] = useState('');

    return (
        <Dialogue
            title="Delete environment?"
            open={open}
            primaryButtonText="Delete environment"
            disabledPrimaryButton={environment.name !== confirmName}
            secondaryButtonText="Close"
            onClick={onConfirm}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Alert severity="error">
                <strong>Danger!</strong> Deleting this environment will result
                in removing all strategies that are active in this environment
                across all feature toggles.
            </Alert>

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
            <StyledLabel>
                In order to delete this environment, please enter the id of the
                environment in the textfield below:{' '}
                <strong>{environment.name}</strong>
            </StyledLabel>
            <StyledInput
                label="Environment name"
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
            />
        </Dialogue>
    );
};
