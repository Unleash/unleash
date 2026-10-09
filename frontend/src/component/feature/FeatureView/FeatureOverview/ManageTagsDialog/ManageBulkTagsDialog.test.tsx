import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    ManageBulkTagsDialog,
    payloadReducer,
} from './ManageBulkTagsDialog.tsx';

const server = testServerSetup();

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

describe('ManageBulkTagsDialog', () => {
    it('adds only the new value when creating a value on the fly', async () => {
        testServerRoute(server, '/api/admin/tag-types', {
            tagTypes: [{ name: 'simple', description: '', icon: '' }],
        });
        testServerRoute(server, '/api/admin/tags/simple', { tags: [] });
        testServerRoute(
            server,
            '/api/admin/tags',
            { value: 'new-value', type: 'simple' },
            'post',
            201,
        );
        const onSubmit = vi.fn();

        render(
            <ManageBulkTagsDialog
                open
                initialValues={[]}
                initialIndeterminateValues={[]}
                onCancel={() => {}}
                onSubmit={onSubmit}
            />,
        );

        await screen.findByDisplayValue('simple');
        await userEvent.type(
            screen.getByLabelText('Select values'),
            'new-value',
        );
        await userEvent.click(
            await screen.findByText('Create new value "new-value"'),
        );
        const saveButton = screen.getByRole('button', { name: 'Save tags' });
        await waitFor(() => expect(saveButton).toBeEnabled());
        await userEvent.click(saveButton);

        expect(onSubmit).toHaveBeenCalledWith({
            addedTags: [{ value: 'new-value', type: 'simple' }],
            removedTags: [],
        });
    });

    it('assigns a partially assigned value to all flags when selected', async () => {
        testServerRoute(server, '/api/admin/tag-types', {
            tagTypes: [{ name: 'simple', description: '', icon: '' }],
        });
        testServerRoute(server, '/api/admin/tags/simple', {
            tags: [{ value: 'partial', type: 'simple' }],
        });
        const partialTag = { value: 'partial', type: 'simple' };
        const onSubmit = vi.fn();

        render(
            <ManageBulkTagsDialog
                open
                initialValues={[partialTag]}
                initialIndeterminateValues={[partialTag]}
                onCancel={() => {}}
                onSubmit={onSubmit}
            />,
        );

        await screen.findByDisplayValue('simple');
        await userEvent.click(screen.getByLabelText('Select values'));
        await userEvent.click(
            await screen.findByRole('option', { name: 'partial' }),
        );
        const partialOption = screen.getByRole('option', { name: 'partial' });
        expect(within(partialOption).getByRole('checkbox')).toBeChecked();
        await userEvent.click(
            screen.getByRole('button', { name: 'Save tags' }),
        );

        expect(onSubmit).toHaveBeenCalledWith({
            addedTags: [partialTag],
            removedTags: [],
        });
    });
});
