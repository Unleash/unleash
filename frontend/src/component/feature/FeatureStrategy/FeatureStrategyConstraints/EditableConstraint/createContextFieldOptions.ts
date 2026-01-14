import type { IUnleashContextDefinition } from 'interfaces/context.ts';
import type { EditableConstraint } from './useEditableConstraint/editable-constraint-type';
import type { SelectOptionGroup } from 'component/common/GeneralSelect/GeneralSelect';

export const createContextFieldOptions = (
    localConstraint: EditableConstraint,
    context: IUnleashContextDefinition[],
    { groupOptions }: { groupOptions: boolean },
) => {
    const existingContextFieldNames = context.map((context) => context.name);
    const contextFieldHasBeenDeleted = !existingContextFieldNames.includes(
        localConstraint.contextName,
    );

    if (!groupOptions) {
        const availableContextFieldNames = contextFieldHasBeenDeleted
            ? [
                  ...existingContextFieldNames,
                  localConstraint.contextName,
              ].toSorted()
            : existingContextFieldNames;

        return availableContextFieldNames.map((option) => ({
            key: option,
            label: option,
        }));
    }

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

    const optList = (opts: { name: string }[]) =>
        opts
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((option) => ({
                key: option.name,
                label: option.name,
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
        contextFieldHasBeenDeleted && {
            groupHeader: 'Deleted context fields',
            options: optList([{ name: localConstraint.contextName }]),
        },
    ].filter(Boolean) as SelectOptionGroup[];
};
