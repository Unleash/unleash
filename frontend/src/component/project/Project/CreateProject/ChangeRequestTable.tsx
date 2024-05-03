import { useMemo, useState } from 'react';
import { type HeaderGroup, useGlobalFilter, useTable } from 'react-table';
import { Box, styled } from '@mui/material';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IChangeRequestConfig } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useTheme } from '@mui/material/styles';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
// import { PROJECT_CHANGE_REQUEST_WRITE } from '../../../../providers/AccessProvider/permissions';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInputBase-input': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

type TableProps = {
    environments: (
        | {
              name: string;
              type: string;
              changeRequestEnabled: false;
          }
        | {
              name: string;
              type: string;
              requiredApprovals: number;
              changeRequestEnabled: boolean;
          }
    )[];
    enableEnvironment: (args: {
        name: string;
        requiredApprovals: number;
    }) => void;
    disableEnvironment: (name: string) => void;
};

export const ChangeRequestTable = (props: TableProps) => {
    const { trackEvent } = usePlausibleTracker();
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        enableEnvironment: string;
        isEnabled: boolean;
        requiredApprovals: number;
    }>({
        isOpen: false,
        enableEnvironment: '',
        isEnabled: false,
        requiredApprovals: 1,
    });

    const theme = useTheme();

    const onRowChange =
        (
            enableEnvironment: string,
            isEnabled: boolean,
            requiredApprovals: number,
        ) =>
        () => {
            setDialogState({
                isOpen: true,
                enableEnvironment,
                isEnabled,
                requiredApprovals,
            });
        };

    const onConfirm = async () => {
        if (dialogState.enableEnvironment) {
            await updateConfiguration();
        }
        setDialogState((state) => ({ ...state, isOpen: false }));
    };

    async function updateConfiguration(config?: IChangeRequestConfig) {
        try {
            // update state here
        } catch (error) {
            // probably not gonna happen because it's not an api call
        }
    }

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
        updateConfiguration({
            project: projectId,
            environment: original.environment,
            enabled: original.changeRequestEnabled,
            requiredApprovals: Number(approvals),
        });
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
                                        sx={{ width: '140px', marginLeft: 1 }}
                                        options={approvalOptions}
                                        value={original.requiredApprovals || 1}
                                        onChange={(approvals) => {
                                            onRequiredApprovalsChange(
                                                original,
                                                approvals,
                                            );
                                        }}
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

                Cell: ({ value, row: { original } }: any) => (
                    <StyledBox data-loading>
                        <PermissionSwitch
                            checked={value}
                            permission={[]}
                            inputProps={{ 'aria-label': original.environment }}
                            onClick={onRowChange(
                                original.environment,
                                original.changeRequestEnabled,
                                original.requiredApprovals,
                            )}
                        />
                    </StyledBox>
                ),
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
                // @ts-ignore
                columns,
                data: props.environments.map((env) => ({
                    environment: env.name,
                    type: env.type,
                    changeRequestEnabled: env.changeRequestEnabled,
                    // @ts-ignore
                    requiredApprovals: env.requiredApprovals ?? 1,
                })),

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
        <Table {...getTableProps()}>
            <SortableTableHeader
                headerGroups={headerGroups as HeaderGroup<object>[]}
            />
            <TableBody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <TableRow hover {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                                <TableCell {...cell.getCellProps()}>
                                    {cell.render('Cell')}
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
