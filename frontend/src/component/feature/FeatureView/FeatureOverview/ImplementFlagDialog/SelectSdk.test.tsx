import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { SelectSdk } from './SelectSdk';

describe('SelectSdk', () => {
    it('always groups sdks into Backend and Frontend sections', async () => {
        const user = userEvent.setup();
        render(<SelectSdk value='Node.js' onChange={vi.fn()} />);

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByText('Backend SDKs')).toBeInTheDocument();
        expect(screen.getByText('Frontend SDKs')).toBeInTheDocument();
    });

    it('selecting an sdk passes its name to onChange', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<SelectSdk value='Node.js' onChange={onChange} />);

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByText('Go'));

        expect(onChange).toHaveBeenCalledWith('Go');
    });
});
