import { useMemo } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';

import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';

import { useTable, useSortBy } from 'react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { sortTypes } from 'utils/sortTypes';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { ConfigureAddonsButton } from './ConfigureAddonButton/ConfigureAddonsButton';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon';
import { IntegrationNameCell } from '../IntegrationNameCell/IntegrationNameCell';
import { IAddonInstallation } from 'interfaces/addons';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IProvider {
    name: string;
    displayName: string;
    description: string;
    documentationUrl: string;
    parameters: object[];
    events: string[];
    installation?: IAddonInstallation;
    deprecated?: string;
}

interface IAvailableAddonsProps {
    providers: IProvider[];
    loading: boolean;
}

/**
 * @deprecated Remove when integrationsRework flag is removed
 */
export const AvailableAddons = ({
    providers,
    loading,
}: IAvailableAddonsProps) => {
    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Provider name',
                description: 'Provider description when loading',
            });
        }

        return providers.map(
            ({ name, displayName, description, deprecated, installation }) => ({
                name,
                displayName,
                description,
                deprecated,
                installation,
            })
        );
    }, [providers, loading]);

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: ({
                    row: {
                        original: { name },
                    },
                }: any) => {
                    return (
                        <IconCell
                            icon={<IntegrationIcon name={name as string} />}
                        />
                    );
                },
            },
            {
                Header: 'Name',
                accessor: 'name',
                width: '90%',
                Cell: ({ row: { original } }: any) => (
                    <IntegrationNameCell provider={original} />
                ),
                sortType: 'alphanumeric',
            },
            {
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <ActionCell>
                        <ConfigureAddonsButton provider={original} />
                    </ActionCell>
                ),
                width: 150,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
        ],
        []
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description'],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
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
        useSortBy
    );

    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title={`Available addons (${rows.length})`} />}
        >
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
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
            </Table>

            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No providers found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No providers available.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};
