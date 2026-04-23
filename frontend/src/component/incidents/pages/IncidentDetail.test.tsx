// frontend/src/component/incidents/pages/IncidentDetail.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from 'themes/theme';
import UIContext from 'contexts/UIContext';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import { IncidentDetail } from './IncidentDetail.tsx';

const renderWithRoute = (id: string) => {
    const uiStub = {
        setToast: () => {},
        toastData: { show: false, text: '', type: 'success' as const, components: [], persist: false },
        showFeedback: false,
        setShowFeedback: () => {},
        themeMode: 'light' as const,
        setThemeMode: () => {},
    };
    const announcerStub = { setAnnouncement: () => {} };
    return render(
        <UIContext.Provider value={uiStub}>
            <AnnouncerContext.Provider value={announcerStub}>
                <ThemeProvider theme={lightTheme}>
                    <MemoryRouter initialEntries={[`/incidents/${id}`]}>
                        <Routes>
                            <Route path='/incidents/:id' element={<IncidentDetail />} />
                        </Routes>
                    </MemoryRouter>
                </ThemeProvider>
            </AnnouncerContext.Provider>
        </UIContext.Provider>
    );
};

describe('IncidentDetail', () => {
    it('renders the high-confidence (A) incident without crashing', () => {
        renderWithRoute('4721');
        expect(screen.getByText(/checkout-service incident/i)).toBeInTheDocument();
        expect(screen.getByText(/Likely cause:/i)).toBeInTheDocument();
        expect(screen.getByText(/87%/)).toBeInTheDocument();
    });

    it('renders the low-confidence (B) incident without crashing', () => {
        renderWithRoute('4720');
        expect(screen.getByText(/cart-service incident/i)).toBeInTheDocument();
        expect(screen.getByText(/Possibly/i)).toBeInTheDocument();
        expect(screen.getByText(/62%/)).toBeInTheDocument();
    });

    it('renders a not-found view for unknown ids', () => {
        renderWithRoute('does-not-exist');
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
});
