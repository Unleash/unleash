import React, { useState, useEffect, useCallback } from 'react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { TableCell } from '@mui/material';
import { FixedSizeList as List, areEqual } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { FeatureToggleSwitch } from './FeatureToggleSwitch/FeatureToggleSwitch';

// Additional imports
import { useRequiredPathParam } from '../../../../hooks/useRequiredPathParam';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';

interface RowProps {
    index: number;
    style: React.CSSProperties;
    data: IFeatureToggleListItem[];
    projectId: string;
}

const Row: React.FC<RowProps> = React.memo(({ index, style, data, projectId }) => {
    const row = data[index];
    if (!row) {
        return <div style={style}>Loading...</div>;
    }
    return (
        <div style={{ ...style, display: 'flex' }} key={row.name}>
            <TableCell component="div" style={{ flexGrow: 1 }}>{row.name}</TableCell>
            <TableCell component="div" style={{ flexGrow: 1 }}>{row.type}</TableCell>
            <TableCell component="div" style={{ flexGrow: 1 }}>
                <FeatureToggleSwitch
                    projectId={projectId}
                    value={false} // Assuming a default value
                    featureId={row.name}
                    environmentName={'development'}
                    onToggle={() => {}} // Replace with your actual toggle function
                />
            </TableCell>
        </div>
    );
}, areEqual);

export const ProjectFeatureFlags = () => {
    const [dataList, setDataList] = useState<IFeatureToggleListItem[]>([]);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const { features, loading } = useFeatureSearch(nextCursor);
    const projectId = useRequiredPathParam('projectId');
    const { onToggle: onFeatureToggle, modals: featureToggleModals } = useFeatureToggleSwitch(projectId);

    const isItemLoaded = useCallback((index) => !!dataList[index], [dataList]);
    const itemCount = hasMore ? dataList.length + 1 : dataList.length;

    const loadMoreItems = useCallback(async () => {
        if (features.length > 0) {
            const newCursor = features[features.length - 1].createdAt;
            setNextCursor(newCursor);
        }
    }, [features]);

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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
                <TableCell component="div" style={{ flexGrow: 1, fontWeight: 'bold' }}>Name</TableCell>
                <TableCell component="div" style={{ flexGrow: 1, fontWeight: 'bold' }}>Type</TableCell>
                <TableCell component="div" style={{ flexGrow: 1, fontWeight: 'bold' }}>Development</TableCell>
            </div>
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
            >
                {({ onItemsRendered, ref }) => (
                    <List
                        height={itemCount * 53} // Height of all rows
                        itemCount={itemCount}
                        itemSize={53} // Adjust the item size to fit your design
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        width={'100%'} // Adjust the width to fit your design
                        itemData={dataList} // Pass the data as itemData
                        project={projectId} // Pass the projectId as project
                    >
                        {Row}
                    </List>
                )}
            </InfiniteLoader>
        </div>
    );
};
