import React, { useState, useEffect, useCallback } from 'react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    Table,
    TableCell,
    useTheme,
    TableHead,
    TableRow,
    Checkbox,
    TableBody,
} from '@mui/material';
import { FixedSizeList as VirtualList, areEqual } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { FeatureToggleSwitch } from './FeatureToggleSwitch/FeatureToggleSwitch';

// Additional imports
import { useRequiredPathParam } from '../../../../hooks/useRequiredPathParam';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import { PageContent } from 'component/common/PageContent/PageContent';
import { CellSortable } from 'component/common/Table/SortableTableHeader/CellSortable/CellSortable';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import AutoSizer from 'react-virtualized-auto-sizer';

interface RowProps {
    index: number;
    style: React.CSSProperties;
    data: IFeatureToggleListItem[];
    projectId: string;
}

const Row: React.FC<RowProps> = React.memo(
    ({ index, style, data, projectId }) => {
        const row = data[index];
        if (!row) {
            return <TableRow style={style}>Loading...</TableRow>;
        }
        return (
            <TableRow
                style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                key={row.name}
            >
                <TableCell
                    style={{
                        width: 65,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Checkbox />
                </TableCell>
                <TableCell
                    style={{
                        width: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FavoriteIconCell value={true} onClick={() => {}} />
                </TableCell>
                <TableCell
                    component='td'
                    style={{
                        flexGrow: 1,
                        width: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {row.name}
                </TableCell>
                <TableCell
                    component='td'
                    style={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {row.type}
                </TableCell>
                <TableCell
                    component='td'
                    style={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <FeatureToggleSwitch
                        projectId={projectId}
                        value={false} // Assuming a default value
                        featureId={row.name}
                        environmentName={'development'}
                        onToggle={() => {}} // Replace with your actual toggle function
                    />
                </TableCell>
            </TableRow>
        );
    },
    areEqual,
);

export const ProjectFeatureFlags = () => {
    const theme = useTheme();
    const [dataList, setDataList] = useState<IFeatureToggleListItem[]>([]);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const { features, loading } = useFeatureSearch(nextCursor);
    const projectId = useRequiredPathParam('projectId');
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const isItemLoaded = useCallback((index) => !!dataList[index], [dataList]);
    const itemCount = hasMore ? dataList.length + 1 : dataList.length;

    const loadMoreItems = useCallback(
        async (startIndex, stopIndex) => {
            // Only load more items if the last item is within the range of what's visible
            if (stopIndex >= dataList.length && !loading && hasMore) {
                if (features.length > 0) {
                    const newCursor = features[features.length - 1].createdAt;
                    setNextCursor(newCursor);
                }
            }
        },
        [features, dataList, loading, hasMore],
    );

    useEffect(() => {
        if (features && features.length === 0) {
            setHasMore(false);
        }
        if (features && features.length > 0) {
            setDataList((prev) => [...prev, ...features]);
            setHasMore(true);
        }
    }, [features]);

    return (
        <PageContent
            style={{
                boxShadow: 'none',
                marginLeft: '1rem',
                minHeight: '100%',
                width: 'calc(100% - 1rem)',
                position: 'relative',
                [theme.breakpoints.down('md')]: {
                    marginLeft: '0',
                    paddingBottom: '4rem',
                    width: 'inherit',
                },
            }}
        >
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
            >
                {({ onItemsRendered, ref }) => (
                    <VirtualList
                        height={window.innerHeight} // Height of all rows
                        itemCount={itemCount}
                        innerElementType={Inner}
                        itemSize={53} // Adjust the item size to fit your design
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        width={'100%'} // Adjust the width to fit your design
                        itemData={dataList} // Pass the data as itemData
                        project={projectId} // Pass the projectId as project
                    >
                        {Row}
                    </VirtualList>
                )}
            </InfiniteLoader>
        </PageContent>
    );
};

const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
    function Inner({ children, ...rest }, ref) {
        //const { header, footer, top } = useContext(VirtualTableContext)
        return (
            <div ref={ref}>
                <Table>
                    <TableHead>
                        <TableRow style={{ display: 'flex' }}>
                            {/* todo make cell sortable flex align center*/}
                            <CellSortable isFlex isSortable={false} width={65}>
                                <Checkbox />
                            </CellSortable>
                            <CellSortable isFlex isSortable={false} width={50}>
                                <FavoriteIconHeader
                                    isActive={false}
                                    onClick={() => {}}
                                />
                            </CellSortable>
                            <CellSortable
                                isFlex
                                isSortable
                                isFlexGrow
                                width={150}
                            >
                                Name
                            </CellSortable>
                            <CellSortable isFlex isSortable isFlexGrow>
                                Type
                            </CellSortable>
                            <CellSortable isFlex isSortable isFlexGrow>
                                Development
                            </CellSortable>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{ position: 'absolute', width: '100%' }}>
                        {children}
                    </TableBody>
                </Table>
            </div>
        );
    },
);
