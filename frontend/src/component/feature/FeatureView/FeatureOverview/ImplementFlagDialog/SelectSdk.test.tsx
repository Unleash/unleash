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

        expect(screen.getByText('Project SDKs')).toBeInTheDocument();
        expect(screen.getByText('Other SDKs')).toBeInTheDocument();
    });

    it('shows all sdks without section headers when no project sdks are provided', () => {
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={vi.fn()} />,
        );

        fireEvent.mouseDown(screen.getByRole('combobox'));

        expect(screen.queryByText('Project SDKs')).not.toBeInTheDocument();
    });
});
