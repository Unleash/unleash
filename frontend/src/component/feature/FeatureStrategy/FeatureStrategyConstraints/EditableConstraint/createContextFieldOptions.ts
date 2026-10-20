import type { IUnleashContextDefinition } from 'interfaces/context.ts';
import type { SelectOptionGroup } from 'component/common/SelectPopover/SelectPopover.tsx';

export const createContextFieldOptions = (
    context: IUnleashContextDefinition[],
    currentContextName?: string,
): SelectOptionGroup<string>[] => {
    const existingContextFieldNames = context.map((context) => context.name);

    const fields = context.reduce(
        ({ project, global }, next) => {
            if (next.project) {
                project.push(next);
            } else {
                global.push(next);
            }
            return { project: project, global: global };
        },
        {
            project: [] as IUnleashContextDefinition[],
            global: [] as IUnleashContextDefinition[],
        },
    );

    const optList = (
        opts: Pick<IUnleashContextDefinition, 'name' | 'legalValues'>[],
    ) =>
        opts
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((option) => ({
                value: option.name,
                label: option.name,
                detail: option.legalValues?.length
                    ? `${option.legalValues.length} legal value${option.legalValues.length === 1 ? '' : 's'}`
                    : undefined,
            }));

    return [
        fields.project.length > 0 && {
            groupHeader: 'Project context fields',
            options: optList(fields.project),
        },
        fields.global.length > 0 && {
            groupHeader: 'Global context fields',
            options: optList(fields.global),
        },
        currentContextName &&
            !existingContextFieldNames.includes(currentContextName) && {
                groupHeader: 'Deleted context fields',
                options: optList([{ name: currentContextName }]),
            },
    ].filter(Boolean) as SelectOptionGroup<string>[];
};
