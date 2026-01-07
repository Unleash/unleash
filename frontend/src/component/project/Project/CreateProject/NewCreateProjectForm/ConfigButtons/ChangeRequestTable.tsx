import { useMemo } from 'react';
import { type HeaderGroup, useGlobalFilter, useTable } from 'react-table';
import { Box, Switch, styled } from '@mui/material';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useTheme } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInputBase-input': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

const StyledTable = styled(Table)(({ theme }) => ({
    th: { whiteSpace: 'nowrap' },
    width: '50rem',
    maxWidth: '90vw',
    'tr:last-of-type > td': {
        borderBottom: 'none',
    },
}));

type TableProps = {
    environments: {
        name: string;
        type: string;
        changeRequestEnabled: boolean;
        requiredApprovals: number;
        configurable: boolean;
    }[];
    enableEnvironment: (name: string, requiredApprovals: number) => void;
    disableEnvironment: (name: string) => void;
};

export const ChangeRequestTable = (props: TableProps) => {
    const theme = useTheme();

    const onToggleEnvironment =
        (
            environmentName: string,
            previousState: boolean,
            requiredApprovals: number,
        ) =>
        () => {
            const newState = !previousState;
            if (newState) {
                props.enableEnvironment(environmentName, requiredApprovals);
            } else {
                props.disableEnvironment(environmentName);
            }
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

    function onRequiredApprovalsChange(original: any, approvals: string) {
        props.enableEnvironment(original.environment, Number(approvals));
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
                Header: 'Required approvals',
                Cell: ({ row: { original } }: any) => {
                    return (
                        <ConditionallyRender
                            condition={original.changeRequestEnabled}
                            show={
                                <StyledBox data-loading>
                                    <GeneralSelect
                                        label={`Set required approvals for ${original.environment}`}
                                        visuallyHideLabel
                                        id={`cr-approvals-${original.environment}`}
                                        sx={{ width: '140px' }}
                                        options={approvalOptions}
                                        value={original.requiredApprovals || 1}
                                        onChange={(approvals) => {
                                            onRequiredApprovalsChange(
                                                original,
                                                approvals,
                                            );
                                        }}
                                        disabled={!original.configurable}
                                        IconComponent={
                                            KeyboardArrowDownOutlined
                                        }
                                        fullWidth
                                    />
                                </StyledBox>
                            }
                        />
                    );
                },
                width: 100,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: 'Status',
                accessor: 'changeRequestEnabled',
                id: 'changeRequestEnabled',
                align: 'center',

                Cell: ({ value, row: { original } }: any) => {
                    return (
                        <StyledBox data-loading>
                            <Switch
                                checked={value}
                                inputProps={{
                                    'aria-label': `${
                                        value ? 'Disable' : 'Enable'
                                    } change requests for ${
                                        original.environment
                                    }`,
                                }}
                                disabled={!original.configurable}
                                onClick={onToggleEnvironment(
                                    original.environment,
                                    original.changeRequestEnabled,
                                    original.requiredApprovals,
                                )}
                            />
                        </StyledBox>
                    );
                },
                width: 100,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        [],
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                // @ts-expect-error
                columns,
                data: props.environments.map((env) => {
                    return {
                        environment: env.name,
                        type: env.type,
                        changeRequestEnabled: env.changeRequestEnabled,
                        requiredApprovals: env.requiredApprovals ?? 1,
                        configurable: env.configurable,
                    };
                }),

                sortTypes,
                autoResetGlobalFilter: false,
                disableSortRemove: true,
                defaultColumn: {
                    Cell: TextCell,
                },
            },
            useGlobalFilter,
        );
    return (
        <StyledTable {...getTableProps()}>
            <SortableTableHeader
                headerGroups={headerGroups as HeaderGroup<object>[]}
            />
            <TableBody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps();
                    return (
                        <TableRow hover key={key} {...rowProps}>
                            {row.cells.map((cell) => {
                                const { key, ...cellProps } =
                                    cell.getCellProps();

                                return (
                                    <TableCell key={key} {...cellProps}>
                                        {cell.render('Cell')}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </TableBody>
        </StyledTable>
    );
};
