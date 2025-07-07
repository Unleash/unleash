import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SegmentFormStepTwo } from './SegmentFormStepTwo.tsx';
import { vi } from 'vitest';
import {
    CREATE_SEGMENT,
    UPDATE_PROJECT_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import type { IConstraintWithId } from 'interfaces/strategy.ts';

const server = testServerSetup();

const setupRoutes = () => {
    testServerRoute(server, '/api/admin/context', [
        { name: 'userId' },
        { name: 'appName' },
        { name: 'environment' },
    ]);

    testServerRoute(server, '/api/admin/ui-config', {
        flags: {},
    });
};

const defaultProps = {
    project: undefined,
    constraints: [] as IConstraintWithId[],
    setConstraints: vi.fn(),
    setCurrentStep: vi.fn(),
    mode: 'create' as const,
};

describe('SegmentFormStepTwo', () => {
    beforeEach(() => {
        setupRoutes();
        defaultProps.setConstraints.mockClear();
    });

    test('adding context field through autocomplete updates constraints list', async () => {
        const user = userEvent.setup();
        render(<SegmentFormStepTwo {...defaultProps} />, {
            permissions: [
                { permission: CREATE_SEGMENT },
                { permission: UPDATE_PROJECT_SEGMENT },
            ],
        });

        const autocomplete =
            await screen.findByPlaceholderText('Select a context');

        await user.click(autocomplete);

        await waitFor(() => {
            expect(screen.getByText('userId')).toBeInTheDocument();
        });

        await user.click(screen.getByText('userId'));

        await waitFor(() => {
            expect(defaultProps.setConstraints).toHaveBeenCalled();
        });
    });
});
