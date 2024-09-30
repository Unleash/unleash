import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    createEnumParam,
    type QueryParamConfig,
    StringParam,
    withDefault,
} from 'use-query-params';
import { sortKeys } from '../ProjectsListSort/ProjectsListSort';

const stateConfig = {
    query: StringParam,
    sortBy: withDefault(
        createEnumParam([...sortKeys]),
        sortKeys[0],
    ) as QueryParamConfig<(typeof sortKeys)[number] | null | undefined>,
    create: StringParam,
} as const;

export const useProjectsListState = () =>
    usePersistentTableState(`projects-list`, stateConfig, ['create']);
