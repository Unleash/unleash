import { useEffect, useState, type VFC } from 'react';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import { useProjectFlagCreators } from 'hooks/api/getters/useProjectFlagCreators/useProjectFlagCreators';
import { formatTag } from 'utils/format-tag';

interface IProjectOverviewFilters {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    project: string;
}

export const ProjectOverviewFilters: VFC<IProjectOverviewFilters> = ({
    state,
    onChange,
    project,
}) => {
    const { tags } = useAllTags();
    const { flagCreators } = useProjectFlagCreators(project);
    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const tagsOptions = (tags || []).map((tag) => {
            const tagString = formatTag(tag);
            return {
                label: tagString,
                value: tagString,
            };
        });

        const flagCreatorsOptions = flagCreators.map((creator) => ({
            label: creator.name,
            value: String(creator.id),
        }));

        const stateOptions = [
            {
                label: 'Active',
                value: 'active',
            },
            {
                label: 'Stale',
                value: 'stale',
            },
            {
                label: 'Potentially stale',
                value: 'potentially-stale',
            },
        ];

        const availableFilters: IFilterItem[] = [
            {
                label: 'State',
                icon: 'hexagon',
                options: stateOptions,
                filterKey: 'state',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            {
                label: 'Tags',
                icon: 'label',
                options: tagsOptions,
                filterKey: 'tag',
                singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
                pluralOperators: [
                    'INCLUDE_ALL_OF',
                    'INCLUDE_ANY_OF',
                    'EXCLUDE_IF_ANY_OF',
                    'EXCLUDE_ALL',
                ],
            },
            {
                label: 'Created date',
                icon: 'today',
                options: [],
                filterKey: 'createdAt',
                dateOperators: ['IS_ON_OR_AFTER', 'IS_BEFORE'],
            },
            {
                label: 'Flag type',
                icon: 'flag',
                options: [
                    { label: 'Release', value: 'release' },
                    { label: 'Experiment', value: 'experiment' },
                    { label: 'Operational', value: 'operational' },
                    { label: 'Kill switch', value: 'kill-switch' },
                    { label: 'Permission', value: 'permission' },
                ],
                filterKey: 'type',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            {
                label: 'Created by',
                icon: 'person',
                options: flagCreatorsOptions,
                filterKey: 'createdBy',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            {
                label: 'Show only archived',
                icon: 'inventory',
                options: [{ label: 'True', value: 'true' }],
                filterKey: 'archived',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
            {
                label: 'Lifecycle stage',
                icon: 'model_training',
                options: [
                    { label: 'Define', value: 'initial' },
                    { label: 'Develop', value: 'pre-live' },
                    { label: 'Rollout production', value: 'live' },
                    { label: 'Cleanup', value: 'completed' },
                ],
                filterKey: 'lifecycle',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(tags), JSON.stringify(flagCreators)]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
