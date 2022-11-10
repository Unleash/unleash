import { styled, TableBody, TableRow } from '@mui/material';
import { IEnvironment } from 'interfaces/environments';
import { useTable } from 'react-table';
import { SortableTableHeader, Table, TableCell } from 'component/common/Table';
import { EnvironmentIconCell } from 'component/environments/EnvironmentTable/EnvironmentIconCell/EnvironmentIconCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useMemo } from 'react';

const StyledTable = styled(Table)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledToggleWarning = styled('p', {
    shouldForwardProp: prop => prop !== 'warning',
})<{ warning?: boolean }>(({ theme, warning }) => ({
    color: warning ? theme.palette.error.dark : theme.palette.text.primary,
}));

interface IEnvironmentTableSingleProps {
    environment: IEnvironment;
    warnEnabledToggles?: boolean;
}

export const EnvironmentTableSingle = ({
    environment,
    warnEnabledToggles,
}: IEnvironmentTableSingleProps) => {
    const COLUMNS = useMemo(
        () => [
            {
                id: 'Icon',
                width: '1%',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: IEnvironment };
                }) => <EnvironmentIconCell environment={original} />,
            },
            {
                Header: 'Name',
                accessor: 'name',
                Cell: TextCell,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: TextCell,
            },
            {
                Header: 'Visible in',
                accessor: (row: IEnvironment) =>
                    row.projectCount === 1
                        ? '1 project'
                        : `${row.projectCount} projects`,
                Cell: ({
                    row: { original },
                    value,
                }: {
                    row: { original: IEnvironment };
                    value: string;
                }) => (
                    <TextCell>
                        {value}
                        <ConditionallyRender
                            condition={Boolean(warnEnabledToggles)}
                            show={
                                <StyledToggleWarning
                                    warning={Boolean(
                                        original.enabledToggleCount &&
                                            original.enabledToggleCount > 0
                                    )}
                                >
                                    {original.enabledToggleCount === 1
                                        ? '1 toggle enabled'
                                        : `${original.enabledToggleCount} toggles enabled`}
                                </StyledToggleWarning>
                            }
                        />
                    </TextCell>
                ),
            },
        ],
        [warnEnabledToggles]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns: COLUMNS as any,
            data: [environment],
            disableSortBy: true,
        });

    return (
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
    );
};
