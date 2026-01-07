import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FreeTextInput } from './FreeTextInput.tsx';

const server = testServerSetup();

const LIMIT = 3;
const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { constraintValues: LIMIT },
    });
};

test('should set error when new constraint values exceed the limit', async () => {
    setupApi();
    const values: string[] = [];
    const errors: string[] = [];
    render(
        <FreeTextInput
            error=''
            values={[]}
            setValues={(newValues) => {
                values.push(...newValues);
            }}
            setError={(newError: string) => {
                errors.push(newError);
            }}
            removeValue={() => {}}
        />,
    );

    await waitFor(async () => {
        const button = await screen.findByText('Add values');
        expect(button).not.toBeDisabled();
    });

    const input = await screen.findByLabelText('Values');
    fireEvent.change(input, {
        target: { value: '1, 2, 3, 4' },
    });
    const button = await screen.findByText('Add values');
    fireEvent.click(button);

    expect(errors).toEqual(['constraints cannot have more than 3 values']);
    expect(values).toEqual([]);
});

test('should set error when old and new constraint values exceed the limit', async () => {
    setupApi();
    const values: string[] = [];
    const errors: string[] = [];
    render(
        <FreeTextInput
            error=''
            values={['1', '2']}
            setValues={(newValues) => {
                values.push(...newValues);
            }}
            setError={(newError: string) => {
                errors.push(newError);
            }}
            removeValue={() => {}}
        />,
    );

    await waitFor(async () => {
        const button = await screen.findByText('Add values');
        expect(button).not.toBeDisabled();
    });

    const input = await screen.findByLabelText('Values');
    fireEvent.change(input, {
        target: { value: '3, 4' },
    });
    const button = await screen.findByText('Add values');
    fireEvent.click(button);

    expect(errors).toEqual(['constraints cannot have more than 3 values']);
    expect(values).toEqual([]);
});

test('should set values', async () => {
    setupApi();
    const values: string[] = [];
    const errors: string[] = [];
    render(
        <FreeTextInput
            error=''
            values={['1', '2']}
            setValues={(newValues) => {
                values.push(...newValues);
            }}
            setError={(newError: string) => {
                errors.push(newError);
            }}
            removeValue={() => {}}
        />,
    );

    await waitFor(async () => {
        const button = await screen.findByText('Add values');
        expect(button).not.toBeDisabled();
    });

    const input = await screen.findByLabelText('Values');
    fireEvent.change(input, {
        target: { value: '2, 3' },
    });
    const button = await screen.findByText('Add values');
    fireEvent.click(button);

    expect(errors).toEqual(['']);
    expect(values).toEqual(['1', '2', '3']);
});

test('should show limit reached indicator', async () => {
    setupApi();
    render(
        <FreeTextInput
            error=''
            values={['1', '2', '3']}
            setValues={() => {}}
            setError={() => {}}
            removeValue={() => {}}
        />,
    );

    await screen.findByText(
        'You have reached the limit for single constraint values',
    );
});
