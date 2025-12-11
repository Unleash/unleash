import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SegmentFormStepOne } from './SegmentFormStepOne.tsx';

const server = testServerSetup();

const setupRoutes = ({
    limit,
    segments,
}: {
    limit: number;
    segments: number;
}) => {
    testServerRoute(server, 'api/admin/segments', {
        segments: [...Array(segments).keys()].map((i) => ({
            name: `segment${i}`,
        })),
    });

    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            SE: true,
        },
        resourceLimits: {
            segments: limit,
        },
    });
};

const irrelevant = () => {};

test('Do not allow next step when limit reached', async () => {
    setupRoutes({ limit: 1, segments: 1 });

    render(
        <SegmentFormStepOne
            name='irrelevant'
            description='irrelevant'
            clearErrors={irrelevant}
            setCurrentStep={irrelevant}
            setDescription={irrelevant}
            setName={irrelevant}
            setProject={irrelevant}
            errors={{}}
            project='irrelevent'
        />,
    );

    await screen.findByText('You have reached the limit for segments');
    const nextStep = await screen.findByText('Next');
    expect(nextStep).toBeDisabled();
});

test('Allows next step when approaching limit', async () => {
    setupRoutes({ limit: 10, segments: 9 });

    render(
        <SegmentFormStepOne
            name='name'
            description='irrelevant'
            clearErrors={irrelevant}
            setCurrentStep={irrelevant}
            setDescription={irrelevant}
            setName={irrelevant}
            setProject={irrelevant}
            errors={{}}
            project='irrelevent'
        />,
    );

    await screen.findByText('You are nearing the limit for segments');
    await waitFor(async () => {
        const nextStep = await screen.findByText('Next');
        expect(nextStep).toBeEnabled();
    });
});
