import { beforeEach, expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { backdropClasses } from '@mui/material/Backdrop';
import { Dialog } from '@mui/material';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { resizeScreen } from 'utils/resizeScreen';
import { CommandBar } from './CommandBar.tsx';
import { CommandBarDialog } from './CommandBarDialog.tsx';
import { SEARCH_ESC_HINT } from 'utils/testIds';

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

    await userEvent.click(
        await dialog.findByRole('link', { name: 'Segments' }),
    );

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    expect(await screen.findByRole('textbox')).toHaveValue('');
});

test('keeps page results in place while flag results load', async () => {
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.type(dialog.getByRole('textbox'), 'segments');
    const pageResult = await dialog.findByRole('link', { name: 'Segments' });

    await dialog.findByRole('link', { name: 'segments-flag' });

    expect(pageResult).toBeVisible();
});

test('shows keyboard hints alongside search results in the search dialog', async () => {
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    const dialog = within(await screen.findByRole('dialog'));

    await userEvent.type(dialog.getByRole('textbox'), 'segments');

    expect(await dialog.findByRole('link', { name: 'Segments' })).toBeVisible();
    expect(dialog.getByText('to navigate')).toBeVisible();
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

const renderClosableSearchDialog = async () => {
    let open = true;
    render(
        <CommandBarDialog
            open={open}
            onOpenChange={(next) => (open = next)}
            inputAction='close'
        />,
    );
    const dialog = within(await screen.findByRole('dialog'));
    return { dialog, isOpen: () => open };
};

test('closes the search dialog with the close button in its input on small screens', async () => {
    const { dialog, isOpen } = await renderClosableSearchDialog();
    await userEvent.type(dialog.getByRole('textbox'), 'segments');

    await userEvent.click(
        dialog.getByRole('button', { name: 'Close command menu' }),
    );

    expect(isOpen()).toBe(false);
});

test('keeps the search results open when Tab moves focus to the close button', async () => {
    const { dialog } = await renderClosableSearchDialog();
    await userEvent.type(dialog.getByRole('textbox'), 'segments');
    const pageResult = await dialog.findByRole('link', { name: 'Segments' });

    await userEvent.tab();

    expect(
        dialog.getByRole('button', { name: 'Close command menu' }),
    ).toHaveFocus();
    expect(pageResult).toBeVisible();
});

test('keeps the esc hint in the search dialog input while typing on desktop', async () => {
    resizeScreen(DESKTOP);
    const { dialog } = await renderClosableSearchDialog();

    await userEvent.type(dialog.getByRole('textbox'), 'segments');

    expect(dialog.getByTestId(SEARCH_ESC_HINT)).toHaveTextContent('esc');
    expect(
        dialog.queryByRole('button', {
            name: /clear search query|close command menu/i,
        }),
    ).not.toBeInTheDocument();
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
    expect(screen.queryByText('to navigate')).not.toBeInTheDocument();
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

    await userEvent.click(
        await screen.findByRole('link', { name: 'Segments' }),
    );

    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
});

test('empties and refocuses the inline search field with the clear button', async () => {
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'segments');

    await userEvent.click(
        screen.getByRole('button', { name: 'Clear search query' }),
    );

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
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

const mockNoSearchResults = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        feedbackUriPath: '/api/feedback',
    });
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });
    testServerRoute(server, '/api/feedback', {}, 'post');
};

test('closes the search dialog after sending missing capability feedback', async () => {
    mockNoSearchResults();
    render(<CommandBar />);
    await userEvent.click(
        screen.getByRole('button', { name: /command menu/i }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.type(dialog.getByRole('textbox'), 'zzzz');
    await userEvent.click(
        await dialog.findByRole('button', { name: 'Suggest capability' }),
    );
    await userEvent.type(
        dialog.getByRole('textbox', { name: 'Describe the capability' }),
        'Please add zzzz',
    );

    await userEvent.click(
        dialog.getByRole('button', { name: 'Send to Unleash' }),
    );

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
});

test('hides the inline results but keeps the query after sending missing capability feedback', async () => {
    mockNoSearchResults();
    resizeScreen(DESKTOP);
    render(<CommandBar />);
    const input = screen.getAllByRole('textbox')[0];
    await userEvent.type(input, 'zzzz');
    await userEvent.click(
        await screen.findByRole('button', { name: 'Suggest capability' }),
    );
    await userEvent.type(
        screen.getByRole('textbox', { name: 'Describe the capability' }),
        'Please add zzzz',
    );

    await userEvent.click(
        screen.getByRole('button', { name: 'Send to Unleash' }),
    );

    await waitFor(() =>
        expect(
            screen.queryByRole('button', { name: 'Send to Unleash' }),
        ).not.toBeInTheDocument(),
    );
    expect(input).toHaveValue('zzzz');
});

test('leaves the arrow keys to the page while the search dialog is closed', () => {
    render(<CommandBar />);

    const notPrevented = fireEvent.keyDown(document.body, {
        key: 'ArrowDown',
    });

    expect(notPrevented).toBe(true);
});

test('leaves Ctrl+K to another open dialog below the md breakpoint', async () => {
    render(
        <>
            <CommandBar />
            <Dialog open>
                <p>other dialog</p>
            </Dialog>
        </>,
    );

    await userEvent.keyboard('{Control>}k{/Control}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
