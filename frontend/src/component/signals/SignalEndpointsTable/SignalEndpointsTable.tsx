import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Button, useMediaQuery } from '@mui/material';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import { useSignalEndpointsApi } from 'hooks/api/actions/useSignalEndpointsApi/useSignalEndpointsApi';
import { ISignalEndpoint } from 'interfaces/signal';
import { SignalEndpointsActionsCell } from './SignalEndpointsActionsCell';
import { SignalEndpointsDeleteDialog } from './SignalEndpointsDeleteDialog';
import { ToggleCell } from 'component/common/Table/cells/ToggleCell/ToggleCell';
import copy from 'copy-to-clipboard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SignalEndpointsTokensCell } from './SignalEndpointsTokensCell';
import { SignalEndpointsModal } from '../SignalEndpointsModal/SignalEndpointsModal';
import { SignalEndpointsTokensDialog } from '../SignalEndpointsModal/SignalEndpointsForm/SignalEndpointsTokens/SignalEndpointsTokensDialog';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { SignalEndpointsSignalsModal } from '../SignalEndpointsSignals/SignalEndpointsSignalsModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

export const SignalEndpointsTable = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const { signalEndpoints, refetch } = useSignalEndpoints();
    const { toggleSignalEndpoint, removeSignalEndpoint } =
        useSignalEndpointsApi();

    const [selectedSignalEndpoint, setSelectedSignalEndpoint] =
        useState<ISignalEndpoint>();
    const [modalOpen, setModalOpen] = useState(false);

    const [tokenDialog, setTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [signalsModalOpen, setSignalsModalOpen] = useState(false);

    const onToggleSignalEndpoint = async (
        { id, name }: ISignalEndpoint,
        enabled: boolean,
    ) => {
        try {
            await toggleSignalEndpoint(id, enabled);
            setToastData({
                title: `"${name}" has been ${enabled ? 'enabled' : 'disabled'}`,
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteConfirm = async ({ id, name }: ISignalEndpoint) => {
        try {
            await removeSignalEndpoint(id);
            setToastData({
                title: `"${name}" has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: ({
                    row: { original: signalEndpoint },
                }: { row: { original: ISignalEndpoint } }) => (
                    <LinkCell
                        title={signalEndpoint.name}
                        onClick={() => {
                            setSelectedSignalEndpoint(signalEndpoint);
                            setModalOpen(true);
                        }}
                        subtitle={signalEndpoint.description}
                    />
                ),
                width: 240,
            },
            {
                Header: 'URL',
                accessor: (row: ISignalEndpoint) =>
                    `${uiConfig.unleashUrl}/api/signal-endpoint/${row.name}`,
                minWidth: 200,
            },
            {
                id: 'tokens',
                Header: 'Tokens',
                accessor: (row: ISignalEndpoint) =>
                    row.tokens?.map(({ name }) => name).join('\n') || '',
                Cell: ({
                    row: { original: signalEndpoint },
                    value,
                }: {
                    row: { original: ISignalEndpoint };
                    value: string;
                }) => (
                    <SignalEndpointsTokensCell
                        signalEndpoint={signalEndpoint}
                        value={value}
                        onCreateToken={() => {
                            setSelectedSignalEndpoint(signalEndpoint);
                            setModalOpen(true);
                        }}
                    />
                ),
                searchable: true,
                maxWidth: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                width: 120,
                maxWidth: 120,
            },
            {
                Header: 'Enabled',
                accessor: 'enabled',
                Cell: ({
                    row: { original: signalEndpoint },
                }: { row: { original: ISignalEndpoint } }) => (
                    <ToggleCell
                        checked={signalEndpoint.enabled}
                        setChecked={(enabled) =>
                            onToggleSignalEndpoint(signalEndpoint, enabled)
                        }
                    />
                ),
                sortType: 'boolean',
                width: 90,
                maxWidth: 90,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({
                    row: { original: signalEndpoint },
                }: { row: { original: ISignalEndpoint } }) => (
                    <SignalEndpointsActionsCell
                        signalEndpointId={signalEndpoint.id}
                        onCopyToClipboard={() => {
                            copy(
                                `${uiConfig.unleashUrl}/api/signal-endpoint/${signalEndpoint.name}`,
                            );
                            setToastData({
                                type: 'success',
                                title: 'Copied to clipboard',
                            });
                        }}
                        onOpenSignals={() => {
                            setSelectedSignalEndpoint(signalEndpoint);
                            setSignalsModalOpen(true);
                        }}
                        onEdit={() => {
                            setSelectedSignalEndpoint(signalEndpoint);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedSignalEndpoint(signalEndpoint);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                width: 90,
                disableSortBy: true,
            },
        ],
        [],
    );

    const [initialState] = useState({
        sortBy: [{ id: 'createdAt', desc: true }],
    });

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any,
            data: signalEndpoints,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdAt'],
            },
        ],
        setHiddenColumns,
        columns,
    );

    return (
        <PageContent
            header={
                <PageHeader
                    title={`Signal endpoints (${signalEndpoints.length})`}
                    actions={
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                setSelectedSignalEndpoint(undefined);
                                setModalOpen(true);
                            }}
                        >
                            New signal endpoint
                        </Button>
                    }
                />
            }
        >
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <TablePlaceholder>
                        No signal endpoints available. Get started by adding
                        one.
                    </TablePlaceholder>
                }
            />
            <SignalEndpointsModal
                signalEndpoint={selectedSignalEndpoint}
                open={modalOpen}
                setOpen={setModalOpen}
                newToken={(token: string) => {
                    setNewToken(token);
                    setTokenDialog(true);
                }}
                onOpenSignals={() => {
                    setModalOpen(false);
                    setSignalsModalOpen(true);
                }}
            />
            <SignalEndpointsSignalsModal
                signalEndpoint={selectedSignalEndpoint}
                open={signalsModalOpen}
                setOpen={setSignalsModalOpen}
                onOpenConfiguration={() => {
                    setSignalsModalOpen(false);
                    setModalOpen(true);
                }}
            />
            <SignalEndpointsTokensDialog
                open={tokenDialog}
                setOpen={setTokenDialog}
                token={newToken}
            />
            <SignalEndpointsDeleteDialog
                signalEndpoint={selectedSignalEndpoint}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
