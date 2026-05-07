import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { sortingFns } from 'utils/sortingFns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { useSearch } from 'hooks/useSearch';
import { useBanners } from 'hooks/api/getters/useBanners/useBanners';
import { useBannersApi } from 'hooks/api/actions/useBannersApi/useBannersApi';
import type { IInternalBanner } from 'interfaces/banner';
import { Banner } from 'component/banners/Banner/Banner';
import { BannersActionsCell } from './BannersActionsCell.tsx';
import { BannerDeleteDialog } from './BannerDeleteDialog.tsx';
import { ToggleCell } from 'component/common/Table/cells/ToggleCell/ToggleCell';
import { BannerModal } from '../BannerModal/BannerModal.tsx';

export const BannersTable = () => {
    const { setToastData, setToastApiError } = useToast();

    const { banners, refetch, loading } = useBanners();
    const { toggleBanner, removeBanner } = useBannersApi();

    const [searchValue, setSearchValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<IInternalBanner>();

    const onToggleBanner = async (
        banner: IInternalBanner,
        enabled: boolean,
    ) => {
        try {
            await toggleBanner(banner.id, enabled);
            setToastData({
                text: `"${banner.message}" has been ${
                    enabled ? 'enabled' : 'disabled'
                }`,
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteConfirm = async (banner: IInternalBanner) => {
        try {
            await removeBanner(banner.id);
            setToastData({
                text: `"${banner.message}" has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo<ColumnDef<IInternalBanner, unknown>[]>(
        () => [
            {
                id: 'message',
                header: 'Banner',
                accessorKey: 'message',
                cell: ({ row: { original: banner } }) => (
                    <Banner
                        banner={{ ...banner, sticky: false }}
                        inline
                        maxHeight={42}
                    />
                ),
                enableSorting: false,
                meta: { minWidth: 200, searchable: true },
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                meta: { width: 120, maxWidth: 120 },
            },
            {
                id: 'enabled',
                header: 'Enabled',
                accessorKey: 'enabled',
                cell: ({ row: { original: banner } }) => (
                    <ToggleCell
                        checked={banner.enabled}
                        setChecked={(enabled) =>
                            onToggleBanner(banner, enabled)
                        }
                    />
                ),
                sortingFn: sortingFns.boolean,
                meta: { width: 90, maxWidth: 90 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: banner } }) => (
                    <BannersActionsCell
                        onEdit={() => {
                            setSelectedBanner(banner);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedBanner(banner);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                enableSorting: false,
                meta: { width: 100, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const [initialState] = useState({
        sorting: [{ id: 'createdAt', desc: true }],
    });

    const { data, getSearchText } = useSearch(columns, searchValue, banners);

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isSmallScreen,
                columns: ['createdAt'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Banners (${rowCount})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={() => {
                                    setSelectedBanner(undefined);
                                    setModalOpen(true);
                                }}
                            >
                                New banner
                            </Button>
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No banners found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No banners available. Get started by adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <BannerModal
                banner={selectedBanner}
                open={modalOpen}
                setOpen={setModalOpen}
            />
            <BannerDeleteDialog
                banner={selectedBanner}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
