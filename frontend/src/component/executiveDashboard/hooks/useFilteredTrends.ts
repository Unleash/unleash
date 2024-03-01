import { useMemo } from 'react';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';

export const useFilteredTrends = <
    T extends {
        project: string;
    },
>(
    input: T[],
    projects: string[],
) =>
    useMemo<T[]>(() => {
        if (projects.length < 1 || projects[0] === allOption.id) {
            return input;
        }

        const output = input.filter((trend) =>
            projects.includes(trend.project),
        ) as T[];

        return output;
    }, [input, projects]);
