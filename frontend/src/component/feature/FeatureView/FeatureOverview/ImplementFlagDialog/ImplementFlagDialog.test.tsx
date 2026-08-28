import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ImplementFlagDialog } from './ImplementFlagDialog';

const server = testServerSetup();

const setupApi = (seenApplications: string[] = []) => {
    testServerRoute(server, '/api/admin/projects/test-project/applications', {
        applications: [],
    });
    testServerRoute(server, '/api/admin/client-metrics/features/test-flag', {
        lastHourUsage: [],
        seenApplications,
    });
};

const defaultProps = {
    onClose: vi.fn(),
    projectId: 'test-project',
    feature: 'test-flag',
};

describe('ImplementFlagDialog', () => {
    it('does not render when closed', () => {
        setupApi();
        render(<ImplementFlagDialog {...defaultProps} open={false} />);

        expect(
            screen.queryByText('Use the flag in your code'),
        ).not.toBeInTheDocument();
    });

    it('renders the title when open', () => {
        setupApi();
        render(<ImplementFlagDialog {...defaultProps} open />);

        expect(
            screen.getByText('Use the flag in your code'),
        ).toBeInTheDocument();
    });

    it('"Finish setup" is disabled before any evaluations', () => {
        setupApi();
        render(<ImplementFlagDialog {...defaultProps} open />);

        expect(
            screen.getByRole('button', { name: 'Finish setup' }),
        ).toBeDisabled();
    });

    it('"Finish setup" is enabled after the first evaluation', async () => {
        setupApi(['my-app']);
        render(<ImplementFlagDialog {...defaultProps} open />);

        await screen.findByText('Got the first evaluation!');
        expect(
            screen.getByRole('button', { name: 'Finish setup' }),
        ).toBeEnabled();
    });
});
