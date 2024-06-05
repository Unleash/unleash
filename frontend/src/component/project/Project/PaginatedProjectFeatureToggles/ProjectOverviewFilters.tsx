import { useEffect, useState, type VFC } from 'react';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';

interface IProjectOverviewFilters {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
}

export const ProjectOverviewFilters: VFC<IProjectOverviewFilters> = ({
    state,
    onChange,
}) => {
    const { tags } = useAllTags();
    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const tagsOptions = (tags || []).map((tag) => ({
            label: `${tag.type}:${tag.value}`,
            value: `${tag.type}:${tag.value}`,
        }));

        const availableFilters: IFilterItem[] = [
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
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(tags)]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
