import { useContext, useMemo, useState, type VFC as FC } from 'react';
import { type HeaderGroup, useGlobalFilter, useTable } from 'react-table';
import { Alert, Box, styled, Typography } from '@mui/material';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestConfig } from 'hooks/api/getters/useChangeRequestConfig/useChangeRequestConfig';
import {
    type IChangeRequestConfig,
    useChangeRequestApi,
} from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { UPDATE_PROJECT } from '@server/types/permissions';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ChangeRequestProcessHelp } from './ChangeRequestProcessHelp/ChangeRequestProcessHelp.tsx';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useTheme } from '@mui/material/styles';
import AccessContext from 'contexts/AccessContext';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { PROJECT_CHANGE_REQUEST_WRITE } from '../../../../providers/AccessProvider/permissions.ts';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInputBase-input': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

export const ChangeRequestTable: FC = () => {
    const { trackEvent } = usePlausibleTracker();
    const { hasAccess } = useContext(AccessContext);
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
    const projectId = useRequiredPathParam('projectId');
    const { data, loading, refetchChangeRequestConfig } =
        useChangeRequestConfig(projectId);
    const { updateChangeRequestEnvironmentConfig } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

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
            await updateChangeRequestEnvironmentConfig(
                config || {
                    project: projectId,
                    environment: dialogState.enableEnvironment,
                    enabled: !dialogState.isEnabled,
                    requiredApprovals: dialogState.requiredApprovals,
                },
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
                Cell: ({ row: { original } }: any) =>
                    original.changeRequestEnabled ? (
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
                            projectId={projectId}
                            permission={[
                                UPDATE_PROJECT,
                                PROJECT_CHANGE_REQUEST_WRITE,
                            ]}
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
                // @ts-expect-error
                columns,
                data,
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

            <Table {...getTableProps()}>
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
            </Table>

            <Dialogue
                onClick={() => {
                    trackEvent('change_request', {
                        props: {
                            eventType: `change request ${
                                !dialogState.isEnabled ? 'enabled' : 'disabled'
                            }`,
                        },
                    });

                    onConfirm();
                }}
                open={dialogState.isOpen}
                onClose={() =>
                    setDialogState((state) => ({ ...state, isOpen: false }))
                }
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
                        <Typography variant='body2' color='text.secondary'>
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
