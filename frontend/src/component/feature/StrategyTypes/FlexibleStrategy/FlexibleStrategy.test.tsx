import { expect, test } from 'vitest';
import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FlexibleStrategy } from './FlexibleStrategy.tsx';

test('manipulates the rollout slider', async () => {
    const Wrapper = () => {
        const [parameters, setParameters] = useState({ rollout: '0' });

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
    expect(slider).toHaveValue('0');

    fireEvent.change(slider, { target: { value: '50' } });

    expect(slider).toHaveValue('50');
});
