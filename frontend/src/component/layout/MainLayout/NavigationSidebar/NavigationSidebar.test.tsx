import { render } from 'utils/testRenderer';
import { NavigationSidebar } from './NavigationSidebar.tsx';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createLocalStorage } from 'utils/createLocalStorage';
import { Route, Routes } from 'react-router-dom';
import { listItemButtonClasses as classes } from '@mui/material/ListItemButton';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

beforeEach(() => {
    window.localStorage.clear();
});

test('switch full mode and mini mode', () => {
    render(<NavigationSidebar />);

    expect(screen.queryByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Applications')).toBeInTheDocument();

    const hide = screen.getByText('Hide (⌘ + B)');

    fireEvent.click(hide);

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();

    const expand = screen.getByTestId('expand-navigation');
    fireEvent.click(expand);

    expect(screen.queryByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Applications')).toBeInTheDocument();
});

test('persist navigation mode and expansion selection in storage', async () => {
    render(<NavigationSidebar />);
    const { value } = createLocalStorage('navigation-mode:v1', {});
    expect(value).toBe('full');

    const configure = screen.getByText('Configure');
    configure.click(); // expand

    const hide = screen.getByText('Hide (⌘ + B)');
    hide.click();

    await waitFor(() => {
        const { value } = createLocalStorage('navigation-mode:v1', {});
        expect(value).toBe('mini');

        const { value: expanded } = createLocalStorage(
            'navigation-expanded:v1',
            {},
        );
        expect(expanded).toEqual(['configure']);
    });
});

test('select active item', async () => {
    render(
        <Routes>
            <Route path={'/search'} element={<NavigationSidebar />} />
        </Routes>,
        { route: '/search' },
    );

    const searchLink = screen.getByRole('link', { name: 'Flags overview' });

    expect(searchLink).toHaveClass(classes.selected);
});

describe('order of items in navigation', () => {
    const getLinks = async () => {
        const configureButton = await screen.findByRole('button', {
            name: /configure/i,
        });
        configureButton.click();
        await waitFor(() =>
            expect(configureButton.getAttribute('aria-expanded')).toBe('true'),
        );

        const links = await screen.findAllByRole('link');
        return links.map((el: HTMLElement) => ({
            text: el.textContent,
            icon: el.querySelector('svg')?.getAttribute('data-testid'),
        }));
    };

    test('menu for open-source', async () => {
        render(<NavigationSidebar />);

        expect(await getLinks()).toMatchSnapshot();
    });

    test('menu for pro plan', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            versionInfo: {
                current: { enterprise: 'version' },
            },
            environment: 'Pro',
        });

        render(<NavigationSidebar />);

        expect(await getLinks()).toMatchSnapshot();
    });

    test('menu for enterprise plan', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            versionInfo: {
                current: { enterprise: 'version' },
            },
            environment: 'Enterprise',
        });
        render(<NavigationSidebar />);

        expect(await getLinks()).toMatchSnapshot();
    });
});
