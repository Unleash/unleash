import { expect, test } from 'vitest';
import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FlexibleStrategy } from './FlexibleStrategy.tsx';

const openAdvancedSettings = async () =>
    fireEvent.click(await screen.findByRole('button', { name: /Advanced/ }));

test('manipulates the rollout slider', async () => {
    const Wrapper = () => {
        const [parameters, setParameters] = useState({
            groupId: 'testid',
            rollout: '0',
            stickiness: 'default',
        });

        const updateParameter = (parameter: string, value: string) => {
            setParameters((prevParameters) => ({
                ...prevParameters,
                [parameter]: value,
            }));
        };

        return (
            <FlexibleStrategy
                parameters={parameters}
                updateParameter={updateParameter}
            />
        );
    };

    render(<Wrapper />);

    const slider = await screen.findByRole('slider', { name: /rollout/i });
    await openAdvancedSettings();
    const groupIdInput = await screen.findByLabelText('Group ID');

    expect(slider).toHaveValue('0');
    expect(groupIdInput).toHaveValue('testid');

    fireEvent.change(slider, { target: { value: '50' } });
    fireEvent.change(groupIdInput, { target: { value: 'newGroupId' } });

    expect(slider).toHaveValue('50');
    expect(groupIdInput).toHaveValue('newGroupId');
});

test('displays groupId error', async () => {
    render(
        <FlexibleStrategy
            parameters={{
                rollout: '50',
                stickiness: 'default',
            }}
            updateParameter={() => {}}
            errors={
                {
                    getFormError: () => 'Field required test',
                } as any
            }
        />,
    );

    await openAdvancedSettings();

    expect(await screen.findByText('Field required test')).toBeInTheDocument();
});

test('renders without crashing when stickiness/groupId is not provided', () => {
    render(
        <FlexibleStrategy
            parameters={{
                rollout: '50',
            }}
            updateParameter={() => {}}
        />,
    );

    const slider = screen.getByRole('slider', { name: /rollout/i });
    expect(slider).toBeInTheDocument();
});
