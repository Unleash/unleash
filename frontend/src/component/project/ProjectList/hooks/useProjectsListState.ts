import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    enumQueryParam,
    stringQueryParam,
    withDefaultQueryParam,
} from 'utils/queryParamSpec';
import { sortKeys } from '../ProjectsListSort/ProjectsListSort.jsx';

export type ProjectsListView = 'cards' | 'list';

const stateConfig = {
    query: stringQueryParam,
    sortBy: withDefaultQueryParam(enumQueryParam(sortKeys), sortKeys[0]),
    create: stringQueryParam,
    view: withDefaultQueryParam(
        enumQueryParam<ProjectsListView>(['cards', 'list']),
        'cards',
    ),
} as const;

export const useProjectsListState = () =>
    usePersistentTableState(`projects-list`, stateConfig, ['create']);
