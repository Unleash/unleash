import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from 'themes/theme';
import { BillingInvoice } from './BillingInvoice.tsx';

describe('BillingInvoice', () => {
    const renderWithTheme = (ui: React.ReactElement) => {
        return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
    };

    it('renders header date and total', () => {
        renderWithTheme(<BillingInvoice />);
        expect(screen.getByText('October 15th')).toBeInTheDocument();
        expect(screen.getAllByText('$8,500')[0]).toBeInTheDocument();
    });

    it('renders usage metrics rows', () => {
        renderWithTheme(<BillingInvoice />);
        expect(screen.getByText('Frontend traffic')).toBeInTheDocument();
        expect(screen.getByText('Service connections')).toBeInTheDocument();
        expect(screen.getByText('Release templates')).toBeInTheDocument();
    });

    it('accordion summary contains date label', () => {
        renderWithTheme(<BillingInvoice />);
        const summary = screen.getByRole('button', { name: /October 15th/i });
        expect(summary).toBeInTheDocument();
    });
});
