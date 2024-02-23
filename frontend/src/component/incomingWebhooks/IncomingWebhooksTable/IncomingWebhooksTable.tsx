import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useMediaQuery } from '@mui/material';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { useIncomingWebhooksApi } from 'hooks/api/actions/useIncomingWebhooksApi/useIncomingWebhooksApi';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { IncomingWebhooksActionsCell } from './IncomingWebhooksActionsCell';
import { IncomingWebhooksDeleteDialog } from './IncomingWebhooksDeleteDialog';
import { ToggleCell } from 'component/common/Table/cells/ToggleCell/ToggleCell';
import copy from 'copy-to-clipboard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IncomingWebhookTokensCell } from './IncomingWebhooksTokensCell';
import { IncomingWebhooksModal } from '../IncomingWebhooksModal/IncomingWebhooksModal';
import { IncomingWebhooksTokensDialog } from '../IncomingWebhooksModal/IncomingWebhooksForm/IncomingWebhooksTokens/IncomingWebhooksTokensDialog';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { IncomingWebhooksEventsModal } from '../IncomingWebhooksEvents/IncomingWebhooksEventsModal';

interface IIncomingWebhooksTableProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedIncomingWebhook?: IIncomingWebhook;
    setSelectedIncomingWebhook: React.Dispatch<
        React.SetStateAction<IIncomingWebhook | undefined>
    >;
}

export const IncomingWebhooksTable = ({
    modalOpen,
    setModalOpen,
    selectedIncomingWebhook,
    setSelectedIncomingWebhook,
}: IIncomingWebhooksTableProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const { incomingWebhooks, refetch } = useIncomingWebhooks();
    const { toggleIncomingWebhook, removeIncomingWebhook } =
        useIncomingWebhooksApi();

    const [tokenDialog, setTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [eventsModalOpen, setEventsModalOpen] = useState(false);

    const onToggleIncomingWebhook = async (
        incomingWebhook: IIncomingWebhook,
        enabled: boolean,
    ) => {
        try {
            await toggleIncomingWebhook(incomingWebhook.id, enabled);
            setToastData({
                title: `"${incomingWebhook.name}" has been ${
                    enabled ? 'enabled' : 'disabled'
                }`,
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteConfirm = async (incomingWebhook: IIncomingWebhook) => {
        try {
            await removeIncomingWebhook(incomingWebhook.id);
            setToastData({
                title: `"${incomingWebhook.name}" has been deleted`,
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
                    row: { original: incomingWebhook },
                }: { row: { original: IIncomingWebhook } }) => (
                    <LinkCell
                        title={incomingWebhook.name}
                        onClick={() => {
                            setSelectedIncomingWebhook(incomingWebhook);
                            setModalOpen(true);
                        }}
                        subtitle={incomingWebhook.description}
                    />
                ),
                width: 240,
            },
            {
                Header: 'URL',
                accessor: (row: IIncomingWebhook) =>
                    `${uiConfig.unleashUrl}/api/incoming-webhook/${row.name}`,
                minWidth: 200,
            },
            {
                id: 'tokens',
                Header: 'Tokens',
                accessor: (row: IIncomingWebhook) =>
                    row.tokens?.map(({ name }) => name).join('\n') || '',
                Cell: ({
                    row: { original: incomingWebhook },
                    value,
                }: {
                    row: { original: IIncomingWebhook };
                    value: string;
                }) => (
                    <IncomingWebhookTokensCell
                        incomingWebhook={incomingWebhook}
                        value={value}
                        onCreateToken={() => {
                            setSelectedIncomingWebhook(incomingWebhook);
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
                    row: { original: incomingWebhook },
                }: { row: { original: IIncomingWebhook } }) => (
                    <ToggleCell
                        checked={incomingWebhook.enabled}
                        setChecked={(enabled) =>
                            onToggleIncomingWebhook(incomingWebhook, enabled)
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
                    row: { original: incomingWebhook },
                }: { row: { original: IIncomingWebhook } }) => (
                    <IncomingWebhooksActionsCell
                        incomingWebhookId={incomingWebhook.id}
                        onCopyToClipboard={() => {
                            copy(
                                `${uiConfig.unleashUrl}/api/incoming-webhook/${incomingWebhook.name}`,
                            );
                            setToastData({
                                type: 'success',
                                title: 'Copied to clipboard',
                            });
                        }}
                        onOpenEvents={() => {
                            setSelectedIncomingWebhook(incomingWebhook);
                            setEventsModalOpen(true);
                        }}
                        onEdit={() => {
                            setSelectedIncomingWebhook(incomingWebhook);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedIncomingWebhook(incomingWebhook);
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
            data: incomingWebhooks,
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
        <>
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <TablePlaceholder>
                        No incoming webhooks available. Get started by adding
                        one.
                    </TablePlaceholder>
                }
            />
            <IncomingWebhooksModal
                incomingWebhook={selectedIncomingWebhook}
                open={modalOpen}
                setOpen={setModalOpen}
                newToken={(token: string) => {
                    setNewToken(token);
                    setTokenDialog(true);
                }}
                onOpenEvents={() => {
                    setModalOpen(false);
                    setEventsModalOpen(true);
                }}
            />
            <IncomingWebhooksEventsModal
                incomingWebhook={selectedIncomingWebhook}
                open={eventsModalOpen}
                setOpen={setEventsModalOpen}
                onOpenConfiguration={() => {
                    setEventsModalOpen(false);
                    setModalOpen(true);
                }}
            />
            <IncomingWebhooksTokensDialog
                open={tokenDialog}
                setOpen={setTokenDialog}
                token={newToken}
            />
            <IncomingWebhooksDeleteDialog
                incomingWebhook={selectedIncomingWebhook}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </>
    );
};
