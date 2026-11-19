import { beforeEach, expect, test } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { resizeScreen } from 'utils/resizeScreen';
import { CommandBar } from './CommandBar.tsx';

const server = testServerSetup();
const BELOW_MD = 600;

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    resizeScreen(BELOW_MD);
});

test('collapses to a search icon below the md breakpoint', () => {
    render(<CommandBar />);

    expect(screen.getByRole('button', { name: /command menu/i })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('opens the search dialog with a focused input when the trigger is clicked', async () => {
    render(<CommandBar />);

    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );

    expect(await screen.findByRole('textbox')).toBeVisible();
});

test('toggles the search dialog with the Ctrl+K hotkey', async () => {
    render(<CommandBar />);

    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('textbox')).toBeVisible();

    await userEvent.keyboard('{Control>}k{/Control}');
    await waitFor(() =>
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
    );
});

test('closing the dialog resets the search input', async () => {
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    await userEvent.type(await screen.findByRole('textbox'), 'hello');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
    );

    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    expect(await screen.findByRole('textbox')).toHaveValue('');
});

test.each([
    [600, 'ArrowDown'],
    [600, 'ArrowUp'],
    [1400, 'ArrowDown'],
    [1400, 'ArrowUp'],
])('leaves %s px unrelated %s events alone while closed', (width, key) => {
    resizeScreen(Number(width));
    render(
        <>
            <CommandBar />
            <textarea aria-label='Unrelated input' />
        </>,
    );
    const input = screen.getByRole('textbox', { name: 'Unrelated input' });
    act(() => input.focus());
    const event = new KeyboardEvent('keydown', {
        key: String(key),
        bubbles: true,
        cancelable: true,
    });
    fireEvent(input, event);

    expect(event.defaultPrevented).toBe(false);
    expect(input).toHaveFocus();
});

test('does not steal arrow keys when focus moves outside the open suggestions', async () => {
    resizeScreen(1400);
    render(
        <>
            <CommandBar />
            <textarea aria-label='Unrelated input' />
        </>,
    );
    await userEvent.click(
        screen.getByRole('textbox', { name: /command menu/i }),
    );
    expect(await screen.findAllByRole('link')).not.toHaveLength(0);
    const input = screen.getByRole('textbox', { name: 'Unrelated input' });
    act(() => input.focus());

    for (const key of ['ArrowDown', 'ArrowUp']) {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(input, event);
        expect(event.defaultPrevented).toBe(false);
        expect(input).toHaveFocus();
    }
});

test.each([
    600, 1400,
])('cycles through suggestions and the input at %s px', async (width) => {
    resizeScreen(width);
    render(<CommandBar />);
    if (width === 600) {
        await userEvent.click(
            screen.getByRole('button', { name: /command menu/i }),
        );
    } else {
        await userEvent.click(
            screen.getByRole('textbox', { name: /command menu/i }),
        );
    }
    const input = await screen.findByRole('textbox', { name: /command menu/i });
    const links = await screen.findAllByRole('link');
    expect(input).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(links[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(links.at(-1)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();

    for (const modifier of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey']) {
        const modifiedEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            [modifier]: true,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(input, modifiedEvent);
        expect(modifiedEvent.defaultPrevented).toBe(false);
        expect(input).toHaveFocus();
    }
});

test('leaves arrow keys alone when there are no suggestions to navigate', async () => {
    resizeScreen(1400);
    testServerRoute(server, '/api/admin/search/features', { features: [] });
    render(<CommandBar />);
    const input = screen.getByRole('textbox', { name: /command menu/i });
    await userEvent.type(input, 'no-matching-command');
    await screen.findByRole('button', { name: 'Suggest capability' });
    expect(screen.queryAllByRole('link')).toHaveLength(0);

    for (const key of ['ArrowDown', 'ArrowUp']) {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(input, event);
        expect(event.defaultPrevented).toBe(false);
        expect(input).toHaveFocus();
    }
});
