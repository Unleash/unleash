import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { beforeEach, expect, test, vi } from 'vitest';
import {
    type IExtendedMilestonePayload,
    useTemplateForm,
} from 'component/releases/hooks/useTemplateForm';
import { TemplateForm } from './TemplateForm.tsx';

const server = testServerSetup();

const setAutomationsFlag = (enabled: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { releaseTemplatesAutomations: enabled },
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

const automatedMilestones = (intervalMinutes: number) => [
    defaultMilestone({ transitionCondition: { intervalMinutes } }),
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

    test('shows add automation only on milestones that have a next one', async () => {
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
        expect(await screen.findAllByText('Add automation')).toHaveLength(1);

        await userEvent.click(screen.getByText('Add milestone'));

        expect(screen.getAllByText('Add automation')).toHaveLength(2);
    });

    test('removing automation omits the transition condition from the payload', async () => {
        const onSubmitPayload = vi.fn();
        renderTemplateForm({
            milestones: automatedMilestones(300),
            onSubmitPayload,
        });

        await userEvent.click(
            await screen.findByLabelText('Remove automation for Milestone 1'),
        );
        await userEvent.click(screen.getByText('Save'));

        expect(
            onSubmitPayload.mock.calls[0][0].milestones[0].transitionCondition,
        ).toBeUndefined();
    });

    test('rejects a zero automation time on submit', async () => {
        const onSubmitPayload = vi.fn();
        renderTemplateForm({
            milestones: automatedMilestones(300),
            onSubmitPayload,
        });
        const input = await screen.findByLabelText('Time duration value');

        await userEvent.clear(input); //sets it to 0
        await userEvent.click(screen.getByText('Save'));

        expect(onSubmitPayload).not.toHaveBeenCalled();
        expect(
            screen.getByText('Automation time must be greater than zero.'),
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
