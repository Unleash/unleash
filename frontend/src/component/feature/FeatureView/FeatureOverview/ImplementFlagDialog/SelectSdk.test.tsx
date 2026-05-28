import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import {
    clientSdks,
    serverSdks,
} from 'component/onboarding/dialog/sharedTypes';
import { SelectSdk } from './SelectSdk';

describe('SelectSdk', () => {
    it('always groups sdks into Backend and Frontend sections', async () => {
        const user = userEvent.setup();
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={vi.fn()} />,
        );

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByText('Backend SDKs')).toBeInTheDocument();
        expect(screen.getByText('Frontend SDKs')).toBeInTheDocument();
    });

    it('marks project sdks connected to the project with an indicator', async () => {
        const user = userEvent.setup();
        render(
            <SelectSdk projectSdks={['Go']} value='Go' onChange={vi.fn()} />,
        );

        await user.click(screen.getByRole('combobox'));

        expect(
            screen.getByTestId('sdk-suggested-indicator'),
        ).toBeInTheDocument();
    });

    it('clearing the selection emits undefined to the parent', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={onChange} />,
        );

        await user.click(screen.getByLabelText('Clear'));

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('selecting an sdk passes its name to onChange', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={onChange} />,
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByText('Go'));

        expect(onChange).toHaveBeenCalledWith('Go');
    });
});
