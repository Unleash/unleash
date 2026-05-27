import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SelectSdk } from './SelectSdk';

describe('SelectSdk', () => {
    it('groups project sdks above other sdks when project sdks are provided', () => {
        render(
            <SelectSdk projectSdks={['Go']} value='Go' onChange={vi.fn()} />,
        );

        fireEvent.mouseDown(screen.getByRole('combobox'));

        expect(screen.getByText('Suggested SDKs')).toBeInTheDocument();
        expect(screen.getByText('Other SDKs')).toBeInTheDocument();
    });

    it('shows all sdks without section headers when no project sdks are provided', () => {
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={vi.fn()} />,
        );

        fireEvent.mouseDown(screen.getByRole('combobox'));

        expect(screen.queryByText('Suggested SDKs')).not.toBeInTheDocument();
        expect(screen.queryByText('Other SDKs')).not.toBeInTheDocument();
    });

    it('calls onChange with the selected sdk name', async () => {
        const onChange = vi.fn();
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={onChange} />,
        );

        fireEvent.mouseDown(screen.getByRole('combobox'));
        fireEvent.click(screen.getByText('Go'));

        expect(onChange).toHaveBeenCalledWith('Go');
    });
});
