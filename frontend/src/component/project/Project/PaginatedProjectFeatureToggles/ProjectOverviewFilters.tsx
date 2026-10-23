import { useEffect, useState, type FC } from 'react';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import { useProjectFlagCreators } from 'hooks/api/getters/useProjectFlagCreators/useProjectFlagCreators';
import { useProjectContextFieldValues } from 'hooks/api/getters/useProjectContextFieldValues/useProjectContextFieldValues';
import { formatTag } from 'utils/format-tag';
import { styled } from '@mui/material';
import { useTracking } from 'hooks/useTracking';
import { filterFavoritesTracking } from 'component/filter/filterFavoritesTracking';

type ProjectOverviewFiltersProps = {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    project: string;
};

const StyledFilters = styled(Filters)({
    padding: 0,
});

export const ProjectOverviewFilters: FC<ProjectOverviewFiltersProps> = ({
    state,
    onChange,
    project,
}) => {
    const { tags } = useAllTags();
    const { flagCreators } = useProjectFlagCreators(project);
    const { contextFieldValues } = useProjectContextFieldValues(project);
    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    const trackFilterFavorites = useTracking(filterFavoritesTracking);

    const onFilterChange = (value: FilterItemParamHolder) => {
        if (value.favorite !== state.favorite) {
            trackFilterFavorites('succeeded', {
                newState: value.favorite ? 'enabled' : 'disabled',
                scope: 'project',
            });
        }
        onChange(value);
    };

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

        const contextFieldValuesByName = new Map<string, string[]>();
        for (const { contextName, value } of contextFieldValues) {
            const values = contextFieldValuesByName.get(contextName) ?? [];
            values.push(value);
            contextFieldValuesByName.set(contextName, values);
        }

        const contextFieldOptions = [...contextFieldValuesByName].flatMap(
            ([contextName, values]) => [
                {
                    label: `${contextName} (any value)`,
                    value: encodeURIComponent(contextName),
                },
                ...values.map((value) => ({
                    label: `${contextName} = ${value}`,
                    value: `${encodeURIComponent(contextName)}=${encodeURIComponent(value)}`,
                })),
            ],
        );

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
                label: 'Last seen',
                icon: 'monitor_heart',
                options: [],
                filterKey: 'lastSeenAt',
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
                    { label: 'Sunset', value: 'sunset' },
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
                label: 'Favorite',
                icon: 'star',
                options: [
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' },
                ],
                filterKey: 'favorite',
                singularOperators: ['IS'] as [string, ...string[]],
                pluralOperators: ['IS_ANY_OF'] as [string, ...string[]],
            },
            {
                label: 'Context field',
                icon: 'data_object',
                options: contextFieldOptions,
                filterKey: 'contextField',
                singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
                pluralOperators: [
                    'INCLUDE_ANY_OF',
                    'INCLUDE_ALL_OF',
                    'EXCLUDE_IF_ANY_OF',
                    'EXCLUDE_ALL',
                ],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [
        JSON.stringify(tags),
        JSON.stringify(flagCreators),
        JSON.stringify(contextFieldValues),
    ]);

    return (
        <StyledFilters
            availableFilters={availableFilters}
            state={state}
            onChange={onFilterChange}
        />
    );
};
