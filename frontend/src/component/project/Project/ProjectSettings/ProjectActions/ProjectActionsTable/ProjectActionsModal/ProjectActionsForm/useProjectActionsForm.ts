import { useActions } from 'hooks/api/getters/useActions/useActions';
import type { IAction, IActionSet, ParameterMatch } from 'interfaces/action';
import { useEffect, useState } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

enum ErrorField {
    NAME = 'name',
    SOURCE = 'source',
    FILTERS = 'filters',
    ACTOR = 'actor',
    ACTIONS = 'actions',
}

export type ActionsFilterState = ParameterMatch & {
    id: string;
    parameter: string;
    error?: string;
};

export type ActionsActionState = Omit<
    IAction,
    'id' | 'createdAt' | 'createdByUserId'
> & {
    id: string;
    error?: string;
};

const DEFAULT_PROJECT_ACTIONS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.SOURCE]: undefined,
    [ErrorField.FILTERS]: undefined,
    [ErrorField.ACTOR]: undefined,
    [ErrorField.ACTIONS]: undefined,
};

export type ProjectActionsFormErrors = Record<ErrorField, string | undefined>;

export const useProjectActionsForm = (action?: IActionSet) => {
    const projectId = useRequiredPathParam('projectId');
    const { actions: actionSets } = useActions(projectId);

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sourceId, setSourceId] = useState<number>(0);
    const [filters, setFilters] = useState<ActionsFilterState[]>([]);
    const [actorId, setActorId] = useState<number>(0);
    const [actions, setActions] = useState<ActionsActionState[]>([]);

    const reloadForm = () => {
        setEnabled(action?.enabled ?? true);
        setName(action?.name || '');
        setDescription(action?.description || '');
        setSourceId(action?.match?.sourceId ?? 0);
        setFilters(
            Object.entries(action?.match?.payload ?? {}).map(
                ([
                    parameter,
                    { inverted, operator, caseInsensitive, value, values },
                ]) => ({
                    id: crypto.randomUUID(),
                    parameter,
                    inverted,
                    operator,
                    caseInsensitive,
                    value,
                    values,
                }),
            ),
        );
        setActorId(action?.actorId ?? 0);
        setActions(
            action?.actions?.map((action) => ({
                id: crypto.randomUUID(),
                action: action.action,
                sortOrder: action.sortOrder,
                executionParams: action.executionParams,
            })) ?? [],
        );
        setValidated(false);
        setErrors(DEFAULT_PROJECT_ACTIONS_FORM_ERRORS);
    };

    useEffect(() => {
        reloadForm();
    }, [action]);

    const [errors, setErrors] = useState<ProjectActionsFormErrors>(
        DEFAULT_PROJECT_ACTIONS_FORM_ERRORS,
    );
    const [validated, setValidated] = useState(false);

    const clearError = (field: ErrorField) => {
        setErrors((errors) => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors((errors) => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        validateFilters(filters);
    }, [filters]);

    useEffect(() => {
        validateActions(actions);
    }, [actions]);

    const isEmpty = (value: string) => !value.length;

    const isNameNotUnique = (value: string) =>
        actionSets?.some(({ id, name }) => id !== action?.id && name === value);

    const isIdEmpty = (value: number) => value === 0;

    const validateName = (name: string) => {
        if (isEmpty(name)) {
            setError(ErrorField.NAME, 'Name is required.');
            return false;
        }

        if (isNameNotUnique(name)) {
            setError(ErrorField.NAME, 'Name must be unique.');
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };

    const validateSourceId = (sourceId: number) => {
        if (isIdEmpty(sourceId)) {
            setError(ErrorField.SOURCE, 'Source is required.');
            return false;
        }

        clearError(ErrorField.SOURCE);
        return true;
    };

    const validateFilters = (filters: ActionsFilterState[]) => {
        if (filters.some(({ error }) => error)) {
            setError(ErrorField.FILTERS, 'One or more filters have errors.');
            return false;
        }

        clearError(ErrorField.FILTERS);
        return true;
    };

    const validateActorId = (sourceId: number) => {
        if (isIdEmpty(sourceId)) {
            setError(ErrorField.ACTOR, 'Service account is required.');
            return false;
        }

        clearError(ErrorField.ACTOR);
        return true;
    };

    const validateActions = (actions: ActionsActionState[]) => {
        if (actions.filter(({ action }) => Boolean(action)).length === 0) {
            setError(ErrorField.ACTIONS, 'At least one action is required.');
            return false;
        }

        clearError(ErrorField.ACTIONS);
        if (actions.some(({ error }) => error)) {
            setError(ErrorField.ACTIONS, 'One or more actions have errors.');
            return false;
        }

        clearError(ErrorField.ACTIONS);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);
        const validSourceId = validateSourceId(sourceId);
        const validFilters = validateFilters(filters);
        const validActorId = validateActorId(actorId);
        const validActions = validateActions(actions);

        setValidated(true);

        return (
            validName &&
            validSourceId &&
            validFilters &&
            validActorId &&
            validActions
        );
    };

    return {
        enabled,
        setEnabled,
        name,
        setName,
        description,
        setDescription,
        sourceId,
        setSourceId,
        filters,
        setFilters,
        actorId,
        setActorId,
        actions,
        setActions,
        errors,
        setErrors,
        validated,
        validateName,
        validateSourceId,
        validateActorId,
        validate,
        reloadForm,
    };
};
