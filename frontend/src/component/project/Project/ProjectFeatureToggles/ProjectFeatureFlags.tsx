import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { Table, TableCell } from '../../../common/Table';
import { TableBody, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import { useRequiredPathParam } from '../../../../hooks/useRequiredPathParam';
import useProject from '../../../../hooks/api/getters/useProject/useProject';
import { useChangeRequestsEnabled } from '../../../../hooks/useChangeRequestsEnabled';
import { FeatureToggleSwitch } from './FeatureToggleSwitch/FeatureToggleSwitch';

interface DataItem {
    name: string;
    type: string;
}


export const ProjectFeatureFlags = () => {
    const [dataList, setDataList] = useState<IFeatureToggleListItem[]>([]);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const { features, loading } = useFeatureSearch(nextCursor);
    const projectId = useRequiredPathParam('projectId');
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);
    const { refetch } = useProject(projectId);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const loadMore = () => {
        console.log('loadMore', hasMore);
        if (hasMore && features.length > 0) {
            console.log('next cursor', features[features.length - 1].createdAt);
            setNextCursor(features[features.length - 1].createdAt);
        }
    };

    useEffect(() => {
        if(features && features.length === 0) {
            setHasMore(false);
        }
        if(features && features.length > 0) {
            setDataList(prev => [...prev, ...features]);
            setHasMore(true);
        }
    }, [JSON.stringify(features)]);

    return <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        useWindow={true}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Development</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>

                {dataList.map((row) => {
                    return <TableRow
                        key={row.name}
                    >
                        <TableCell sx={{pt: 10}}>
                            {row.name}
                        </TableCell>
                        <TableCell sx={{pt: 10}}>{row.type}</TableCell>
                        <TableCell>
                            <FeatureToggleSwitch
                                projectId={projectId}
                                value={false}
                                featureId={row.name}
                                environmentName={'development'}
                                onToggle={() => {}}
                            />
                        </TableCell>
                    </TableRow>;
                })}

            </TableBody>
        </Table>
    </InfiniteScroll>;
};
