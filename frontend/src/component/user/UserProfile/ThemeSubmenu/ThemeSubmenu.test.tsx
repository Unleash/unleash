import { beforeEach, expect, test } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuList } from '@mui/material';
import { render } from 'utils/testRenderer';
import { setLocalStorageItem } from 'utils/storage';
import { ThemeSubmenu } from './ThemeSubmenu.tsx';

beforeEach(() => {
    localStorage.removeItem('unleash-theme');
});

const renderThemeSubmenu = (
    props: Partial<Parameters<typeof ThemeSubmenu>[0]> = {},
) => {
    render(
        <MenuList>
            <ThemeSubmenu onCloseAll={() => {}} itemSx={{}} {...props} />
        </MenuList>,
    );
    return screen.getByRole('menuitem', { name: /Theme/ });
};

const findOption = (label: string) =>
    screen.findByRole('menuitem', { name: label });

const openWithKeyboard = async (trigger: HTMLElement) => {
    act(() => trigger.focus());
    await userEvent.keyboard('{ArrowRight}');
    await findOption('Dark');
};

test('opens the theme options when hovering the theme item', async () => {
    const trigger = renderThemeSubmenu();

    await userEvent.hover(trigger);

    expect(await findOption('Dark')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('closes the theme options when the pointer leaves the theme item', async () => {
    const trigger = renderThemeSubmenu();
    await userEvent.hover(trigger);
    await findOption('Dark');

    await userEvent.unhover(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
        expect(
            screen.queryByRole('menuitem', { name: 'Dark' }),
        ).not.toBeInTheDocument(),
    );
});

test('keeps the theme options open when the pointer moves into them', async () => {
    const trigger = renderThemeSubmenu();
    await userEvent.hover(trigger);

    await userEvent.hover(await findOption('Dark'));

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Dark' })).toBeInTheDocument();
});

test('keeps the theme options next to the theme item when the pointer moves into them', async () => {
    const trigger = renderThemeSubmenu();
    trigger.getBoundingClientRect = () => new DOMRect(0, 100, 200, 40);
    await userEvent.hover(trigger);
    const option = await findOption('Dark');

    await userEvent.hover(option);

    expect(option.closest('.MuiPopover-paper')).toHaveStyle({
        top: '100px',
        left: '200px',
    });
});

test('closes the theme options when the pointer leaves them', async () => {
    const trigger = renderThemeSubmenu();
    await userEvent.hover(trigger);
    const option = await findOption('Dark');
    await userEvent.hover(option);

    await userEvent.unhover(option);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('opens the theme options with the right arrow key', async () => {
    const trigger = renderThemeSubmenu();
    act(() => trigger.focus());

    await userEvent.keyboard('{ArrowRight}');

    expect(await findOption('Dark')).toHaveFocus();
});

test('wraps focus to the last theme option when pressing up on the first', async () => {
    await openWithKeyboard(renderThemeSubmenu());

    await userEvent.keyboard('{ArrowUp}');

    expect(screen.getByRole('menuitem', { name: 'System' })).toHaveFocus();
});

test('wraps focus to the first theme option when pressing down on the last', async () => {
    await openWithKeyboard(renderThemeSubmenu());
    await userEvent.keyboard('{ArrowUp}');

    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('menuitem', { name: 'Dark' })).toHaveFocus();
});

test('returns focus to the theme item with the left arrow key', async () => {
    const trigger = renderThemeSubmenu();
    await openWithKeyboard(trigger);

    await userEvent.keyboard('{ArrowLeft}');

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('marks the current theme among the options', async () => {
    setLocalStorageItem('unleash-theme', 'light');
    const trigger = renderThemeSubmenu();

    await userEvent.hover(trigger);

    expect(await findOption('Light')).toContainElement(
        screen.getByTestId('CheckIcon'),
    );
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(1);
});

test('shows the current theme next to the theme item when asked to', () => {
    setLocalStorageItem('unleash-theme', 'light');

    const trigger = renderThemeSubmenu({ trailing: 'current-mode' });

    expect(trigger).toHaveTextContent('Light');
    expect(
        screen.queryByTestId('KeyboardArrowRightIcon'),
    ).not.toBeInTheDocument();
});

test('shows a chevron instead of the current theme by default', () => {
    setLocalStorageItem('unleash-theme', 'light');

    const trigger = renderThemeSubmenu();

    expect(trigger).not.toHaveTextContent('Light');
    expect(screen.getByTestId('KeyboardArrowRightIcon')).toBeInTheDocument();
});
