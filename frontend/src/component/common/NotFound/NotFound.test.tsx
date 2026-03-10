import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'themes/ThemeProvider';
import { setLocalStorageItem, getLocalStorageItem } from 'utils/storage';
import NotFound from './NotFound';

const LAST_VIEWED_PAGE_KEY = ':lastViewedPage:localStorage:v2';

const LocationDisplay = () => {
    const { pathname } = useLocation();
    return <div data-testid='location'>{pathname}</div>;
};

const renderNotFound = (initialPath = '/not-exists') =>
    render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route path='*' element={<NotFound />} />
                    <Route path='/' element={<LocationDisplay />} />
                </Routes>
            </MemoryRouter>
        </ThemeProvider>,
    );

beforeEach(() => {
    localStorage.clear();
});

test('renders the not found message', () => {
    renderNotFound();
    expect(
        screen.getByText("Ooops. That's a page we haven't toggled on yet."),
    ).toBeInTheDocument();
});

test('Go home button resets lastViewedPage and navigates to /', async () => {
    setLocalStorageItem(LAST_VIEWED_PAGE_KEY, '/playground');
    renderNotFound();

    await userEvent.click(screen.getByRole('button', { name: /go home/i }));

    // should navigate away from the not-found page
    expect(screen.getByTestId('location')).toHaveTextContent('/');

    // lastViewedPage should be reset to the default (/personal)
    expect(getLocalStorageItem(LAST_VIEWED_PAGE_KEY)).toBe('/personal');
});
