import { useMemo, useState } from 'react';
import type { JSONContent } from 'component/common/ReactJSONEditor/ReactJSONEditor';
import { BadRequestError } from 'utils/apiUtils';
import { formatUnknownError } from 'utils/formatUnknownError';

type FormState =
    | { status: 'editing'; content: JSONContent }
    | { status: 'saving'; content: JSONContent }
    | { status: 'saved'; content: JSONContent }
    | { status: 'rejected'; content: JSONContent; error: string };

type ParsedJson = { valid: true; value: unknown } | { valid: false };

const parseJson = (content: JSONContent): ParsedJson => {
    if ('json' in content) {
        return { valid: true, value: content.json };
    }
    try {
        return { valid: true, value: JSON.parse(content.text) };
    } catch (_e) {
        return { valid: false };
    }
};

const isEditable = (state: FormState) =>
    state.status === 'editing' || state.status === 'rejected';

export const usePayloadSchemaForm = (savedSchema?: Record<string, unknown>) => {
    const [state, setState] = useState<FormState>({
        status: 'editing',
        content: savedSchema ? { json: savedSchema } : { text: '{}' },
    });

    const json = useMemo(() => parseJson(state.content), [state.content]);

    const save = async (
        send: (schema: unknown) => Promise<void>,
    ): Promise<FormState> => {
        if (!json.valid) return state;
        const { content } = state;
        setState({ status: 'saving', content });
        try {
            await send(json.value);
            const saved: FormState = { status: 'saved', content };
            setState(saved);
            return saved;
        } catch (error: unknown) {
            if (error instanceof BadRequestError) {
                const rejected: FormState = {
                    status: 'rejected',
                    content,
                    error: formatUnknownError(error),
                };
                setState(rejected);
                return rejected;
            }
            setState({ status: 'editing', content });
            throw error;
        }
    };

    return {
        state,
        editable: isEditable(state),
        canSave: isEditable(state) && json.valid,
        parsedSchema: json.valid ? json.value : undefined,
        edit: (content: JSONContent) =>
            setState((s) =>
                isEditable(s) ? { status: 'editing', content } : s,
            ),
        save,
    };
};
