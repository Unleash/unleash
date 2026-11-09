import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from './dark-theme';
import { controlHeights } from './controls';
import Input from 'component/common/Input/Input';

test('dark theme outlined input keeps the shared control sizing', () => {
    render(
        <ThemeProvider theme={darkTheme}>
            <Input label='Name' value='' onChange={() => {}} />
        </ThemeProvider>,
    );

    const root = screen
        .getByLabelText('Name')
        .closest('.MuiOutlinedInput-root');

    expect(root).toHaveStyle({ height: `${controlHeights.large}px` });
});
