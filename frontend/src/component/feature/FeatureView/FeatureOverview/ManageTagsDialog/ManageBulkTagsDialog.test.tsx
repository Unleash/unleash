import { payloadReducer } from './ManageBulkTagsDialog.tsx';

describe('payloadReducer', () => {
    it('should add a tag to addedTags and remove it from removedTags', () => {
        const initialState = {
            addedTags: [{ type: 'simple', value: 'A' }],
            removedTags: [
                { type: 'simple', value: 'B' },
                { type: 'simple', value: 'C' },
            ],
        };

        const action = {
            type: 'add' as const,
            payload: { type: 'simple', value: 'B' },
        };

        const newState = payloadReducer(initialState, action);

        expect(newState).toMatchObject({
            addedTags: [
                { type: 'simple', value: 'A' },
                { type: 'simple', value: 'B' },
            ],
            removedTags: [{ type: 'simple', value: 'C' }],
        });
    });

    it('should remove a tag from addedTags and add it to removedTags', () => {
        const initialState = {
            addedTags: [
                { type: 'simple', value: 'A' },
                { type: 'simple', value: 'B' },
            ],
            removedTags: [{ type: 'simple', value: 'C' }],
        };

        const action = {
            type: 'remove' as const,
            payload: { type: 'simple', value: 'B' },
        };

        const newState = payloadReducer(initialState, action);

        expect(newState).toMatchObject({
            addedTags: [{ type: 'simple', value: 'A' }],
            removedTags: [
                { type: 'simple', value: 'C' },
                { type: 'simple', value: 'B' },
            ],
        });
    });

    it('should empty addedTags and set removedTags to the payload on clear', () => {
        const initialState = {
            addedTags: [{ type: 'simple', value: 'A' }],
            removedTags: [{ type: 'simple', value: 'B' }],
        };

        const action = {
            type: 'clear' as const,
            payload: [{ type: 'simple', value: 'C' }],
        };

        const newState = payloadReducer(initialState, action);

        expect(newState).toMatchObject({
            addedTags: [],
            removedTags: [{ type: 'simple', value: 'C' }],
        });
    });

    it('should empty both addedTags and removedTags on reset', () => {
        const initialState = {
            addedTags: [{ type: 'simple', value: 'test' }],
            removedTags: [{ type: 'simple', value: 'test2' }],
        };

        const action = {
            type: 'reset' as const,
        };

        const newState = payloadReducer(initialState, action);
        expect(newState).toMatchObject({
            addedTags: [],
            removedTags: [],
        });
    });
});
