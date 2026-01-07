import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
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

    const columns = useMemo(
        () => [
            {
                Header: 'Banner',
                accessor: 'message',
                Cell: ({ row: { original: banner } }: any) => (
                    <Banner
                        banner={{ ...banner, sticky: false }}
                        inline
                        maxHeight={42}
                    />
                ),
                disableSortBy: true,
                minWidth: 200,
                searchable: true,
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
                    row: { original: banner },
                }: {
                    row: { original: IInternalBanner };
                }) => (
                    <ToggleCell
                        checked={banner.enabled}
                        setChecked={(enabled) =>
                            onToggleBanner(banner, enabled)
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
                Cell: ({ row: { original: banner } }: any) => (
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
                width: 100,
                disableSortBy: true,
            },
        ],
        [],
    );

    const [initialState] = useState({
        sortBy: [{ id: 'createdAt', desc: true }],
    });

    const { data, getSearchText } = useSearch(columns, searchValue, banners);

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any,
            data,
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
            isLoading={loading}
            header={
                <PageHeader
                    title={`Banners (${rows.length})`}
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
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
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
