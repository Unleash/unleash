import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { beforeEach, expect, test } from 'vitest';
import {
    type IExtendedMilestonePayload,
    useTemplateForm,
} from 'component/releases/hooks/useTemplateForm';
import type { TransitionConditionSchema } from 'openapi';
import { TemplateForm } from './TemplateForm.tsx';

const server = testServerSetup();

const setAutomationsFlag = (enabled: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            releaseTemplatesAutomations: enabled,
            exposureBasedAutomation: enabled,
        },
    });

const defaultMilestone = (
    overrides: Partial<IExtendedMilestonePayload> = {},
): IExtendedMilestonePayload => ({
    id: 'milestone-1',
    name: 'Milestone 1',
    sortOrder: 0,
    strategies: [
        {
            id: 'strategy-1',
            name: 'flexibleRollout',
            sortOrder: 0,
        } as NonNullable<IExtendedMilestonePayload['strategies']>[number],
    ],
    ...overrides,
});

const ANY_INTERVAL_MINUTES = 300;

const automatedMilestones = (
    transitionCondition: TransitionConditionSchema = {
        intervalMinutes: ANY_INTERVAL_MINUTES,
    },
) => [
    defaultMilestone({ transitionCondition }),
    defaultMilestone({ id: 'milestone-2', name: 'Milestone 2', sortOrder: 1 }),
];

const TemplateFormHarness = ({
    initialMilestones,
    onSubmitPayload = () => {},
}: {
    initialMilestones: IExtendedMilestonePayload[];
    onSubmitPayload?: (payload: unknown) => void;
}) => {
    const form = useTemplateForm('My template', '', initialMilestones);

    return (
        <TemplateForm
            name={form.name}
            setName={form.setName}
            description={form.description}
            setDescription={form.setDescription}
            milestones={form.milestones}
            setMilestones={form.setMilestones}
            errors={form.errors}
            clearErrors={form.clearErrors}
            clearError={form.clearError}
            formTitle='Release template'
            formatApiCode={() => ''}
            handleSubmit={(event) => {
                event.preventDefault();
                form.clearErrors();
                if (Object.keys(form.validate()).length === 0) {
                    onSubmitPayload(form.getTemplatePayload());
                }
            }}
        >
            <button type='submit'>Save</button>
        </TemplateForm>
    );
};

const renderTemplateForm = ({
    milestones = [
        defaultMilestone(),
        defaultMilestone({
            id: 'milestone-2',
            name: 'Milestone 2',
            sortOrder: 1,
        }),
    ],
    onSubmitPayload,
}: {
    milestones?: IExtendedMilestonePayload[];
    onSubmitPayload?: (payload: unknown) => void;
} = {}) =>
    render(
        <TemplateFormHarness
            initialMilestones={milestones}
            onSubmitPayload={onSubmitPayload}
        />,
    );

describe('milestone automations', () => {
    beforeEach(() => {
        setAutomationsFlag(true);
    });

    test('shows automate this transition only on milestones that have a next one', async () => {
        renderTemplateForm({
            milestones: [
                defaultMilestone({ strategies: undefined }),
                defaultMilestone({
                    id: 'milestone-2',
                    name: 'Milestone 2',
                    sortOrder: 1,
                    strategies: undefined,
                }),
            ],
        });
        expect(
            await screen.findAllByText('Automate this transition'),
        ).toHaveLength(1);

        await userEvent.click(screen.getByText('Add milestone'));

        expect(screen.getAllByText('Automate this transition')).toHaveLength(2);
    });

    test('removing automation omits the transition condition from the payload', async () => {
        const submittedPayloads: unknown[] = [];
        renderTemplateForm({
            milestones: automatedMilestones(),
            onSubmitPayload: (payload) => submittedPayloads.push(payload),
        });

        await userEvent.click(
            await screen.findByLabelText('Remove automation for Milestone 1'),
        );
        await userEvent.click(screen.getByText('Save'));

        expect(submittedPayloads).toMatchObject([
            {
                milestones: [
                    { transitionCondition: undefined },
                    { transitionCondition: undefined },
                ],
            },
        ]);
    });

    test('saves an exposure based automation in the payload', async () => {
        const submittedPayloads: unknown[] = [];
        renderTemplateForm({
            milestones: automatedMilestones(),
            onSubmitPayload: (payload) => submittedPayloads.push(payload),
        });

        await userEvent.click(await screen.findByLabelText('Condition unit'));
        await userEvent.click(
            await screen.findByRole('option', { name: 'Exposures' }),
        );
        const input = screen.getByLabelText('Condition value');
        await userEvent.clear(input);
        await userEvent.type(input, '1000');
        await userEvent.click(screen.getByText('Save'));

        expect(submittedPayloads).toMatchObject([
            {
                milestones: [
                    {
                        transitionCondition: {
                            type: 'exposure',
                            minimumExposures: 1000,
                        },
                    },
                    { transitionCondition: undefined },
                ],
            },
        ]);
    });

    test('rejects a zero automation time on submit', async () => {
        const submittedPayloads: unknown[] = [];
        renderTemplateForm({
            milestones: automatedMilestones(),
            onSubmitPayload: (payload) => submittedPayloads.push(payload),
        });
        const input = await screen.findByLabelText('Condition value');

        await userEvent.clear(input); //sets it to 0
        await userEvent.click(screen.getByText('Save'));

        expect(submittedPayloads).toEqual([]);
        expect(
            screen.getByText('Automation value must be greater than zero.'),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('the last milestone has no automation in the payload', () => {
        const { result } = renderHook(() =>
            useTemplateForm('My template', '', [
                defaultMilestone({ id: 'milestone-2', name: 'Milestone 2' }),
                defaultMilestone({
                    sortOrder: 1,
                    transitionCondition: { intervalMinutes: 30 },
                }),
            ]),
        );

        expect(result.current.getTemplatePayload().milestones).toMatchObject([
            { id: 'milestone-2', transitionCondition: undefined },
            { id: 'milestone-1', transitionCondition: undefined },
        ]);
    });
});
