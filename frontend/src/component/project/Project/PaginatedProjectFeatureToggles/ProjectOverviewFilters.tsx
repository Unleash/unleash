import { useEffect, useState, VFC } from 'react';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import {
    FilterItemParamHolder,
    Filters,
    IFilterItem,
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
