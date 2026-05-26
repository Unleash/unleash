import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SelectSdk } from './SelectSdk';

describe('SelectSdk', () => {
    it('renders the selected SDK', () => {
        render(
            <SelectSdk projectSdks={[]} value='Node.js' onChange={vi.fn()} />,
        );
        expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('renders with project SDKs', () => {
        render(
            <SelectSdk
                projectSdks={['Python', 'Go']}
                value='Python'
                onChange={vi.fn()}
            />,
        );
        expect(screen.getByText('Python')).toBeInTheDocument();
    });
});
