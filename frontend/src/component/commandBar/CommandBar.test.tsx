import { beforeEach, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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
