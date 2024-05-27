import { render } from 'utils/testRenderer';
import { NavigationSidebar } from './NavigationSidebar';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createLocalStorage } from 'utils/createLocalStorage';

beforeEach(() => {
    window.localStorage.clear();
});

test('switch full mode and mini mode', () => {
    render(<NavigationSidebar />);

    expect(screen.queryByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Applications')).toBeInTheDocument();
    expect(screen.queryByText('Users')).toBeInTheDocument();

    const hide = screen.getByText('Hide (⌘ + B)');
    hide.click();

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();

    const expand = screen.getByTestId('expand-navigation');
    fireEvent.click(expand);

    expect(screen.queryByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Applications')).toBeInTheDocument();
    expect(screen.queryByText('Users')).toBeInTheDocument();
});

test('persist navigation mode and expansion selection in storage', async () => {
    render(<NavigationSidebar />);
    const { value } = createLocalStorage('navigation-mode:v1', {});
    expect(value).toBe('full');

    const configure = screen.getByText('Configure');
    configure.click(); // expand
    configure.click(); // hide
    const admin = screen.getByText('Admin');
    admin.click();

    const hide = screen.getByText('Hide (⌘ + B)');
    hide.click();

    await waitFor(() => {
        const { value } = createLocalStorage('navigation-mode:v1', {});
        expect(value).toBe('mini');

        const { value: expanded } = createLocalStorage(
            'navigation-expanded:v1',
            {},
        );
        expect(expanded).toEqual(['admin']);
    });
});
