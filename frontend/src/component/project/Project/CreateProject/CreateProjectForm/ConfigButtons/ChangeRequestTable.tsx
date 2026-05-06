import { useMemo } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Box, Switch, styled } from '@mui/material';
import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
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

type EnvironmentRow = {
    environment: string;
    type: string;
    changeRequestEnabled: boolean;
    requiredApprovals: number;
    configurable: boolean;
};

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

    function onRequiredApprovalsChange(
        original: EnvironmentRow,
        approvals: string,
    ) {
        props.enableEnvironment(original.environment, Number(approvals));
    }

    const data = useMemo<EnvironmentRow[]>(
        () =>
            props.environments.map((env) => ({
                environment: env.name,
                type: env.type,
                changeRequestEnabled: env.changeRequestEnabled,
                requiredApprovals: env.requiredApprovals ?? 1,
                configurable: env.configurable,
            })),
        [props.environments],
    );

    const columns = useMemo<ColumnDef<EnvironmentRow, unknown>[]>(
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
                cell: ({ row: { original } }) => (
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
                                    value={String(
                                        original.requiredApprovals || 1,
                                    )}
                                    onChange={(approvals) => {
                                        onRequiredApprovalsChange(
                                            original,
                                            approvals,
                                        );
                                    }}
                                    disabled={!original.configurable}
                                    IconComponent={KeyboardArrowDownOutlined}
                                    fullWidth
                                />
                            </StyledBox>
                        }
                    />
                ),
                enableSorting: false,
                meta: { width: 100 },
            },
            {
                id: 'changeRequestEnabled',
                header: 'Status',
                accessorKey: 'changeRequestEnabled',
                cell: ({ getValue, row: { original } }) => {
                    const value = Boolean(getValue());
                    return (
                        <StyledBox data-loading>
                            <Switch
                                checked={value}
                                disabled={!original.configurable}
                                onClick={onToggleEnvironment(
                                    original.environment,
                                    original.changeRequestEnabled,
                                    original.requiredApprovals,
                                )}
                                slotProps={{
                                    input: {
                                        'aria-label': `${
                                            value ? 'Disable' : 'Enable'
                                        } change requests for ${
                                            original.environment
                                        }`,
                                    },
                                }}
                            />
                        </StyledBox>
                    );
                },
                enableSorting: false,
                meta: { width: 100, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
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
        <StyledTable>
            <SortableTableHeaderV8 tableInstance={table} />
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
        </StyledTable>
    );
};
