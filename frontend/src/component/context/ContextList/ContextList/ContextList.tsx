import { type FC, useMemo, useState } from 'react';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue as ConfirmDialogue } from 'component/common/Dialogue/Dialogue';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import useContextsApi from 'hooks/api/actions/useContextsApi/useContextsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { AddContextButton } from '../AddContextButton.tsx';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { sortTypes } from 'utils/sortTypes';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ContextActionsCell } from '../ContextActionsCell.tsx';
import Adjust from '@mui/icons-material/Adjust';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { Search } from 'component/common/Search/Search';
import { UsedInCell } from '../UsedInCell.tsx';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

const ContextList: FC = () => {
    const projectId = useOptionalPathParam('projectId');
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const [contextFieldToDelete, setContextFieldToDelete] = useState<string>();
    const { context, refetchUnleashContext, loading } = useUnleashContext(
        undefined,
        projectId,
    );
    const { removeContext } = useContextsApi(projectId);
    const { setToastData, setToastApiError } = useToast();

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
            });
        }

        return context
            .map(
                ({
                    name,
                    description,
                    sortOrder,
                    usedInProjects,
                    usedInFeatures,
                }) => ({
                    name,
                    description,
                    sortOrder,
                    usedInProjects,
                    usedInFeatures,
                }),
            )
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [context, loading]);

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: () => <IconCell icon={<Adjust color='disabled' />} />,
                disableGlobalFilter: true,
            },
            {
                Header: 'Name',
                accessor: 'name',
                width: '70%',
                Cell: ({
                    row: {
                        original: { name, description },
                    },
                }: any) => {
                    const editUrl = projectId
                        ? `/projects/${projectId}/settings/context/edit/${name}`
                        : `/context/edit/${name}`;

                    return (
                        <LinkCell
                            title={name}
                            to={editUrl}
                            subtitle={description}
                        />
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Used in',
                width: '60%',
                Cell: ({ row: { original } }: any) => (
                    <UsedInCell original={original} />
                ),
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({
                    row: {
                        original: { name, usedInFeatures },
                    },
                }: any) => (
                    <ContextActionsCell
                        name={name}
                        onDelete={() => {
                            setContextFieldToDelete(name);
                            setShowDelDialogue(true);
                        }}
                        allowDelete={usedInFeatures === 0}
                    />
                ),
                width: 150,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
            {
                accessor: 'sortOrder',
                disableGlobalFilter: true,
                sortType: 'number',
            },
        ],
        [],
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description', 'sortOrder'],
        }),
        [],
    );

    const onDeleteContext = async () => {
        try {
            if (contextFieldToDelete === undefined) {
                throw new Error();
            }
            await removeContext(contextFieldToDelete);
            refetchUnleashContext();
            setToastData({
                type: 'success',
                text: 'Context field deleted',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        setContextFieldToDelete(undefined);
        setShowDelDialogue(false);
    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy,
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Context fields (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <AddContextButton />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
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
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No contexts found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No context fields available. Get started by
                                adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={onDeleteContext}
                onClose={() => {
                    setContextFieldToDelete(undefined);
                    setShowDelDialogue(false);
                }}
                title='Really delete context field'
            />
        </PageContent>
    );
};

export default ContextList;
