import { useActions } from 'hooks/api/getters/useActions/useActions';
import { IActionSet } from 'interfaces/action';
import { useEffect, useState } from 'react';
import { UIAction } from './ActionItem';
import { v4 as uuidv4 } from 'uuid';

export enum ErrorField {
    NAME = 'name',
    TRIGGER = 'trigger',
    ACTOR = 'actor',
    ACTIONS = 'actions',
}

export interface IActionFilter {
    id: string;
    parameter: string;
    value: string;
}

const DEFAULT_PROJECT_ACTIONS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.TRIGGER]: undefined,
    [ErrorField.ACTOR]: undefined,
    [ErrorField.ACTIONS]: undefined,
};

export type ProjectActionsFormErrors = Record<ErrorField, string | undefined>;

export const useProjectActionsForm = (action?: IActionSet) => {
    const { actions: actionSets } = useActions();

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [sourceId, setSourceId] = useState<number>(0);
    const [filters, setFilters] = useState<IActionFilter[]>([]);
    const [actorId, setActorId] = useState<number>(0);
    const [actions, setActions] = useState<UIAction[]>([]);

    const reloadForm = () => {
        setEnabled(action?.enabled ?? true);
        setName(action?.name || '');
        setValidated(false);
        if (action?.actorId) {
            setActorId(action?.actorId);
        }
        if (action?.match) {
            const { sourceId, payload } = action.match;
            setSourceId(sourceId);
            setFilters(
                Object.entries(payload).map(([parameter, value]) => ({
                    id: uuidv4(),
                    parameter,
                    value: value as string,
                })),
            );
        }
        if (action?.actions) {
            setActions(
                action.actions.map((action) => ({
                    id: uuidv4(),
                    action: action.action,
                    sortOrder: action.sortOrder,
                    executionParams: action.executionParams,
                })),
            );
        }
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
            setError(ErrorField.TRIGGER, 'Incoming webhook is required.');
            return false;
        }

        clearError(ErrorField.TRIGGER);
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

    const validateActions = (actions: UIAction[]) => {
        if (actions.length === 0) {
            setError(ErrorField.ACTIONS, 'At least one action is required.');
            return false;
        }

        clearError(ErrorField.ACTIONS);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);
        const validSourceId = validateSourceId(sourceId);
        const validActorId = validateActorId(actorId);
        const validActions = validateActions(actions);

        setValidated(true);

        return validName && validSourceId && validActorId && validActions;
    };

    return {
        enabled,
        setEnabled,
        name,
        setName,
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
        validate,
        reloadForm,
    };
};
