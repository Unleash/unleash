import type { JSONContent } from 'component/common/ReactJSONEditor/ReactJSONEditor';

export type SchemaParseResult =
    | { state: 'empty' }
    | { state: 'unparsable' }
    | { state: 'parsed'; value: unknown };

export const parseJson = (content: JSONContent): SchemaParseResult => {
    if ('json' in content) {
        return { state: 'parsed', value: content.json };
    }
    if (content.text.trim() === '') {
        return { state: 'empty' };
    }
    try {
        return { state: 'parsed', value: JSON.parse(content.text) };
    } catch (_e) {
        return { state: 'unparsable' };
    }
};
