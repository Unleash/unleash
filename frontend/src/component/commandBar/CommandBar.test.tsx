import { beforeEach, expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { backdropClasses } from '@mui/material/Backdrop';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { resizeScreen } from 'utils/resizeScreen';
import { CommandBar } from './CommandBar.tsx';

const server = testServerSetup();
const BELOW_MD = 600;
const DESKTOP = 1280;

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/search/features', {
        features: [{ name: 'segments-flag', project: 'default' }],
        total: 1,
    });
    resizeScreen(BELOW_MD);
});

test('collapses to a search icon below the md breakpoint', () => {
    render(<CommandBar />);

    expect(
        screen.getByRole('button', { name: 'Command menu (Ctrl+K)' }),
    ).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('opens the search dialog with a focused input when the trigger is clicked', async () => {
    render(<CommandBar />);

    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );

    expect(await screen.findByRole('textbox')).toHaveFocus();
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

test('closes the search dialog and clears the search when a result is picked', async () => {
    render(<CommandBar />);
    const trigger = screen.getByRole('button', { name: /command menu/i });
    await userEvent.click(trigger);
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.type(dialog.getByRole('textbox'), 'segments');
    // page results stay hidden until the flag search settles
    await dialog.findByRole('link', { name: 'segments-flag' });

    await userEvent.click(dialog.getByRole('link', { name: 'Segments' }));

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    expect(await screen.findByRole('textbox')).toHaveValue('');
});

test('moves through the results in the search dialog with the arrow keys', async () => {
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    const input = dialog.getByRole('textbox');
    const results = dialog.getAllByRole('link');

    await userEvent.keyboard('{ArrowDown}');
    expect(results[0]).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveFocus();
});

test('closes the search dialog on a click outside it', async () => {
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    await screen.findByRole('dialog');

    await userEvent.click(document.querySelector(`.${backdropClasses.root}`)!);

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
});

test('toggles focus on the inline search field with Ctrl+K on desktop', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getByRole('textbox');

    await userEvent.keyboard('{Control>}k{/Control}');
    expect(input).toHaveFocus();

    await userEvent.keyboard('{Control>}k{/Control}');
    expect(input).not.toHaveFocus();
});

test('shows suggestions while the inline search field is focused', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);

    await userEvent.click(screen.getByRole('textbox'));

    expect(screen.getByText('Pages')).toBeVisible();
});

test('hides the inline suggestions on a click outside', async () => {
    resizeScreen(DESKTOP);
    render(
        <>
            <CommandBar />
            <p>outside</p>
        </>,
    );
    await userEvent.click(screen.getByRole('textbox'));

    await userEvent.click(screen.getByText('outside'));

    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
});

test('hides the inline suggestions and blurs the field on Escape', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    expect(input).not.toHaveFocus();
});

test('hides the inline suggestions on Tab', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    await userEvent.click(screen.getByRole('textbox'));

    await userEvent.tab();

    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
});

test('hides the inline suggestions and clears the field when a result is picked', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'segments');
    // page results stay hidden until the flag search settles
    await screen.findByRole('link', { name: 'segments-flag' });

    await userEvent.click(screen.getByRole('link', { name: 'Segments' }));

    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
});

test('moves through the results with the arrow keys and wraps to the field', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    const results = screen.getAllByRole('link');

    await userEvent.keyboard('{ArrowDown}');
    expect(results[0]).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(results[1]).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(input).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(results.at(-1)).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
});

test('keeps Ctrl+K from reaching the browser', () => {
    render(<CommandBar />);

    const browserGetsKey = fireEvent.keyDown(document.body, {
        key: 'k',
        ctrlKey: true,
    });

    expect(browserGetsKey).toBe(false);
});
