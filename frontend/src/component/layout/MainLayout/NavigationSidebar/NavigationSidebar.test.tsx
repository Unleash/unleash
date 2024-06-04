import { render } from 'utils/testRenderer';
import { NavigationSidebar } from './NavigationSidebar';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createLocalStorage } from 'utils/createLocalStorage';
import { Route, Routes } from 'react-router-dom';
import { listItemButtonClasses as classes } from '@mui/material/ListItemButton';
import {
    type LastViewedFlag,
    useLastViewedFlags,
} from 'hooks/useLastViewedFlags';
import { type FC, useEffect } from 'react';
import { useLastViewedProject } from 'hooks/useLastViewedProject';

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

test('select active item', async () => {
    render(
        <Routes>
            <Route path={'/search'} element={<NavigationSidebar />} />
        </Routes>,
        { route: '/search' },
    );

    const links = screen.getAllByRole('link');

    expect(links[1]).toHaveClass(classes.selected);
});

const SetupComponent: FC<{ project: string; flags: LastViewedFlag[] }> = ({
    project,
    flags,
}) => {
    const { setLastViewed: setProject } = useLastViewedProject();
    const { setLastViewed: setFlag } = useLastViewedFlags();

    useEffect(() => {
        setProject(project);
        flags.forEach((flag) => {
            setFlag(flag);
        });
    }, []);

    return <NavigationSidebar />;
};

test('print recent projects and flags', async () => {
    render(
        <SetupComponent
            project={'projectA'}
            flags={[{ featureId: 'featureA', projectId: 'projectB' }]}
        />,
    );

    await screen.findByText('projectA');
    await screen.findByText('featureA');
});
