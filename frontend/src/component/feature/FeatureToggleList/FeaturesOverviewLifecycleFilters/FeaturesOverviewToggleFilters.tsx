import { type FC, useEffect, useState } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import { formatTag } from 'utils/format-tag';

type FeaturesOverviewToggleFiltersProps = {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
};

export const FeaturesOverviewToggleFilters: FC<
    FeaturesOverviewToggleFiltersProps
> = ({ state, onChange }) => {
    const { projects } = useProjects();
    const { segments } = useSegments();
    const { tags } = useAllTags();

    const stateOptions = [
        {
            label: 'Active',
            value: 'active',
        },
        {
            label: 'Stale',
            value: 'stale',
        },
    ];

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));
        const segmentsOptions = (segments || []).map((segment) => ({
            label: segment.name,
            value: segment.name,
        }));
        const tagsOptions = (tags || []).map((tag) => ({
            label: formatTag(tag),
            value: formatTag(tag),
        }));

        const hasMultipleProjects = projectsOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            {
                label: 'State',
                icon: 'hexagon',
                options: stateOptions,
                filterKey: 'state',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            ...(hasMultipleProjects
                ? ([
                      {
                          label: 'Project',
                          icon: 'topic',
                          options: projectsOptions,
                          filterKey: 'project',
                          singularOperators: ['IS', 'IS_NOT'],
                          pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
                      },
                  ] as IFilterItem[])
                : []),
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
                label: 'Segment',
                icon: 'donut_large',
                options: segmentsOptions,
                filterKey: 'segment',
                singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
                pluralOperators: [
                    'INCLUDE_ANY_OF',
                    'INCLUDE_ALL_OF',
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
    }, [
        JSON.stringify(projects),
        JSON.stringify(segments),
        JSON.stringify(tags),
    ]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
