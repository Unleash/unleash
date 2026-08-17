import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { Intro } from './Intro.tsx';
import { generateIntroUsers } from './introModel.ts';

const next = () =>
    fireEvent.click(screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON'));

const renderAdvancedIntro = ({
    onComplete = vi.fn(),
    onFinish,
}: {
    onComplete?: () => void;
    onFinish?: () => void;
} = {}) =>
    render(
        <Intro
            onComplete={onComplete}
            onFinish={onFinish}
            advancedStepsEnabled
        />,
    );

const completeReleasePlan = () => {
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    for (let milestone = 0; milestone < 3; milestone++) {
        act(() => {
            vi.advanceTimersByTime(6600);
        });
    }
};

const observeAndRecoverManually = () => {
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    act(() => {
        vi.advanceTimersByTime(3600);
    });
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
};

const advanceLiveTraffic = (duration: number) => {
    for (let elapsed = 0; elapsed < duration; elapsed += 900) {
        act(() => {
            vi.advanceTimersByTime(Math.min(900, duration - elapsed));
        });
    }
};

const retryWithSafeguard = () => {
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    advanceLiveTraffic(9_500);
};

test('starts with a gradual my-feature rollout and context cards', () => {
    renderAdvancedIntro();

    expect(
        screen.getByText('Start by toggling the flag in production'),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/of 20 users see my-feature/),
    ).not.toHaveTextContent('%');
    expect(screen.getByText('Click any user for details.')).toBeInTheDocument();
    expect(screen.queryByText('Controlled release')).not.toBeInTheDocument();
    expect(screen.queryByText('Release')).not.toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID'),
    ).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getAllByRole('button')[0]);
    const popover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(popover).toHaveStyle({ overflowY: 'auto' });
    expect(screen.getByText('Feature disabled')).toBeInTheDocument();
    expect(screen.getByText('Context')).toBeInTheDocument();
    expect(
        screen.getByText(
            /Ada doesn't see my-feature because production is disabled/,
        ),
    ).toBeInTheDocument();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    fireEvent.change(screen.getByRole('slider', { name: 'Rollout %' }), {
        target: { value: '100' },
    });
    expect(screen.getByText('Feature enabled')).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'smart',
            ),
    ).toBe(true);
    expect(
        screen.getByText(
            /Ada sees my-feature because the 100% rollout covers buckets 1–100 \(theirs is \d+\)/,
        ),
    ).toBeInTheDocument();
});

test('closes the user preview when moving to the next step', () => {
    renderAdvancedIntro();

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getAllByRole('button')[0]);
    expect(screen.getByTestId('QUICK_TOUR_INTRO_POPOVER')).toBeInTheDocument();

    next();

    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_POPOVER'),
    ).not.toBeInTheDocument();
});

test('explains gradual rollout using the Unleash documentation', async () => {
    renderAdvancedIntro();

    fireEvent.mouseOver(screen.getByLabelText('Help'));
    expect(
        await screen.findByText(/Release a feature to a percentage/),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('link', {
            name: 'Read more in the documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/guides/gradual-rollout',
    );
});

test('walks through the connected story to the showcase', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    next();
    expect(
        screen.getByText('Target who can see your feature'),
    ).toBeInTheDocument();

    next();
    expect(screen.getByText('Run experiments')).toBeInTheDocument();

    next();
    expect(screen.getByText('Automate the rollout')).toBeInTheDocument();
    completeReleasePlan();
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_4')).getByText(
            'Running',
        ),
    ).toBeInTheDocument();

    next();
    expect(screen.getByText('Observe the release')).toBeInTheDocument();
    act(() => {
        vi.advanceTimersByTime(5000);
    });
    expect(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    ).not.toBeChecked();
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).not.toBeInTheDocument();
    observeAndRecoverManually();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).toBeInTheDocument();
    expect(
        screen.getByText('Issue contained with one click'),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/without waiting for a fix or redeployment/),
    ).toBeInTheDocument();

    next();
    expect(screen.getByText('Automate the response')).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    retryWithSafeguard();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_AUTO_RECOVERY'),
    ).toBeInTheDocument();

    next();
    expect(screen.getByTestId('QUICK_TOUR_INTRO_SHOWCASE')).toBeInTheDocument();
    expect(screen.getByText('Tour complete!')).toBeInTheDocument();
    expect(
        screen.getByText('What do you want to do next?'),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Replay intro' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Create feature flag' }),
    ).toBeInTheDocument();
    vi.useRealTimers();
}, 10000);

test('finishes after the three core steps when advanced steps are disabled', () => {
    const onFinish = vi.fn();
    render(
        <Intro
            onComplete={vi.fn()}
            onFinish={onFinish}
            advancedStepsEnabled={false}
        />,
    );

    const stepper = screen.getByTestId('QUICK_TOUR_INTRO_STEPPER');
    expect(within(stepper).getByText('Rollout')).toBeInTheDocument();
    expect(within(stepper).getByText('Targeting')).toBeInTheDocument();
    expect(within(stepper).getByText('Experiments')).toBeInTheDocument();
    expect(within(stepper).queryByText('Automation')).not.toBeInTheDocument();
    next();
    next();
    expect(screen.getByText('Run experiments')).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON'),
    ).toHaveTextContent('Finish');

    next();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('QUICK_TOUR_INTRO_SHOWCASE')).toBeInTheDocument();
    expect(screen.queryByText('Automate the rollout')).not.toBeInTheDocument();
});

test('navigates back to a completed step from the stepper', () => {
    renderAdvancedIntro();
    next();
    next();
    expect(screen.getByText('Run experiments')).toBeInTheDocument();

    const stepper = screen.getByTestId('QUICK_TOUR_INTRO_STEPPER');
    fireEvent.click(within(stepper).getByText('Rollout'));
    expect(
        screen.getByText('Start by toggling the flag in production'),
    ).toBeInTheDocument();
});

test('keeps metrics live without errors until production is enabled', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    next();
    next();
    next();
    completeReleasePlan();
    next();

    const charts = screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS');
    expect(
        screen.getByText(/Releases can fail in production/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    expect(screen.queryByText('Live')).not.toBeInTheDocument();
    expect(screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON')).toBeEnabled();
    expect(screen.getAllByRole('button', { name: 'Start now' })).toHaveLength(
        4,
    );
    expect(
        within(charts).queryByTestId('QUICK_TOUR_INTRO_EVENT_DISABLED'),
    ).not.toBeInTheDocument();
    for (const metric of ['SUCCESS', 'ERROR']) {
        const value = screen.getByTestId(
            `QUICK_TOUR_INTRO_${metric}_METRIC_VALUE`,
        );
        const line = screen.getByTestId(
            `QUICK_TOUR_INTRO_${metric}_METRIC_LINE`,
        );
        expect(value).toHaveStyle({
            color: line.getAttribute('stroke'),
        });
    }

    act(() => {
        vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText('Search errors')).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).not.toBeInTheDocument();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_PROGRESS'),
    ).toHaveAttribute('data-duration-ms', '5400');
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'View strategy' },
        ),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
        screen.getByText('Proceed after 15 minutes from milestone start'),
    ).toBeInTheDocument();
    const enabledMarkers = within(charts)
        .getAllByTestId('QUICK_TOUR_INTRO_EVENT_ENABLED')
        .map((marker) =>
            marker.closest('[data-testid="QUICK_TOUR_INTRO_EVENT_MARKER"]'),
        );
    within(charts)
        .getAllByTestId('QUICK_TOUR_INTRO_EVENT_ENABLED')
        .forEach((marker) => {
            expect(marker).toHaveStyle({ cursor: 'pointer' });
        });
    expect(within(charts).getAllByTestId('ToggleOnIcon')).toHaveLength(2);
    enabledMarkers.forEach((marker) => {
        expect(marker).toHaveStyle({ left: '100%' });
    });
    act(() => {
        vi.advanceTimersByTime(1000);
    });
    enabledMarkers.forEach((marker) => {
        expect(marker).not.toHaveStyle({ left: '100%' });
    });
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .filter(
                (preview) =>
                    preview.getAttribute('data-experience') === 'error',
            ),
    ).toHaveLength(0);

    advanceLiveTraffic(1700);
    const errorPreviews = screen
        .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
        .filter(
            (preview) => preview.getAttribute('data-experience') === 'error',
        );
    expect(errorPreviews).toHaveLength(1);
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC_VALUE'),
    ).toHaveTextContent(`${errorPreviews.length}`);
    expect(screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC')).toHaveAttribute(
        'data-max',
        '20',
    );

    const firstErroredCard = errorPreviews[0].closest('button')!;
    advanceLiveTraffic(5400);
    expect(
        within(firstErroredCard).getByTestId('QUICK_TOUR_INTRO_USER_STATUS'),
    ).toHaveAttribute('data-experience', 'error');
    const milestoneEvents = within(charts).getAllByTestId(
        'QUICK_TOUR_INTRO_EVENT_MILESTONE',
    );
    expect(milestoneEvents).toHaveLength(2);
    milestoneEvents.forEach((event) => {
        expect(event).toHaveAttribute(
            'aria-label',
            'Milestone started: Expand to 60% of Pro + Enterprise in Norway + US',
        );
    });
    expect(within(charts).getAllByTestId('FlagOutlinedIcon')).toHaveLength(2);

    fireEvent.click(firstErroredCard);
    const popover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(
        within(popover).getByTestId('QUICK_TOUR_INTRO_ERROR_PREVIEW'),
    ).toBeInTheDocument();
    expect(
        within(popover).getByTestId('QUICK_TOUR_INTRO_MOCK_FRAME'),
    ).toHaveAttribute('data-experience', 'error');
    expect(within(popover).getByText('Feature error')).toBeInTheDocument();
    expect(within(popover).getByText(/returned an error/)).toBeInTheDocument();

    advanceLiveTraffic(30_000);
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .filter(
                (preview) =>
                    preview.getAttribute('data-experience') === 'error',
            ),
    ).toHaveLength(20);
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC_VALUE'),
    ).toHaveTextContent('20');
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_SUCCESS_METRIC_VALUE'),
    ).toHaveTextContent('0');
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MANUAL_GUIDANCE'),
    ).toHaveTextContent(/Disable production/);
    expect(
        screen
            .getByTestId('QUICK_TOUR_INTRO_USER_GRID')
            .compareDocumentPosition(
                screen.getByTestId('QUICK_TOUR_INTRO_MANUAL_GUIDANCE'),
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const successfulBeforeDisable = Number(
        screen.getByTestId('QUICK_TOUR_INTRO_SUCCESS_METRIC_VALUE').textContent,
    );
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    expect(
        within(charts).getAllByTestId('QUICK_TOUR_INTRO_EVENT_DISABLED'),
    ).toHaveLength(2);
    expect(within(charts).getAllByTestId('ToggleOffIcon')).toHaveLength(2);
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_MANUAL_GUIDANCE'),
    ).not.toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).toBeInTheDocument();
    expect(
        Number(
            screen.getByTestId('QUICK_TOUR_INTRO_SUCCESS_METRIC_VALUE')
                .textContent,
        ),
    ).toBe(successfulBeforeDisable);
    advanceLiveTraffic(900);
    const successfulAfterFirstRecoverySample = Number(
        screen.getByTestId('QUICK_TOUR_INTRO_SUCCESS_METRIC_VALUE').textContent,
    );
    expect(successfulAfterFirstRecoverySample).toBeGreaterThan(
        successfulBeforeDisable,
    );
    expect(successfulAfterFirstRecoverySample).toBeLessThan(128);
    vi.useRealTimers();
}, 10000);

test('groups rapid environment events without inventing an incident', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    next();
    next();
    next();
    completeReleasePlan();
    next();

    const secondMilestone = screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_2');
    fireEvent.click(
        within(secondMilestone).getByRole('button', {
            name: 'Start now',
        }),
    );
    expect(within(secondMilestone).getByText('Running')).toBeInTheDocument();
    expect(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    ).toBeChecked();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );

    const groups = within(
        screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS'),
    ).getAllByTestId('QUICK_TOUR_INTRO_EVENT_GROUP');
    expect(groups).toHaveLength(2);
    const groupCounts = within(
        screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS'),
    ).getAllByTestId('QUICK_TOUR_INTRO_EVENT_GROUP_COUNT');
    expect(groupCounts).toHaveLength(2);
    groupCounts.forEach((count) => {
        expect(count).toHaveTextContent('2');
    });
    fireEvent.mouseOver(groups[0]);
    act(() => {
        vi.advanceTimersByTime(1000);
    });
    const tooltip = screen.getByRole('tooltip');
    expect(within(tooltip).getByText('2 events occurred')).toBeInTheDocument();
    const tooltipEvents = within(tooltip).getAllByTestId(
        'QUICK_TOUR_INTRO_EVENT_TOOLTIP_ITEM',
    );
    expect(tooltipEvents.map((event) => event.textContent)).toEqual([
        'Enabled in production',
        'Disabled in production',
    ]);
    expect(within(tooltip).getByTestId('ToggleOnIcon')).toBeInTheDocument();
    expect(within(tooltip).getByTestId('ToggleOffIcon')).toBeInTheDocument();
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByText('Issue contained with one click'),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
});

test('starts the release plan from the environment and supports manual milestones', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    next();
    next();
    next();
    expect(
        screen.getByText(
            /A release plan saves those choices as reusable milestones/,
        ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Release plan added')).not.toBeInTheDocument();
    expect(screen.queryByText('Environment')).not.toBeInTheDocument();
    expect(screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON')).toBeEnabled();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );

    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByText(
            'Running',
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_PROGRESS'),
    ).toHaveAttribute('data-duration-ms', '6500');
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'Start now' },
        ),
    ).toBeDisabled();
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByTestId(
            'QUICK_TOUR_INTRO_MILESTONE_PROGRESS',
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ENABLED_COUNT'),
    ).toHaveTextContent('1');
    expect(screen.queryByText('Started just now')).not.toBeInTheDocument();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByText(
            'Paused (disabled in environment)',
        ),
    ).toBeInTheDocument();
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'Start now' },
        ),
    ).toBeInTheDocument();
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );

    const firstMilestone = screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1');
    const strategyButton = within(firstMilestone).getByRole('button', {
        name: 'Hide strategy',
    });
    expect(strategyButton).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstMilestone).getByText('Plan')).toBeInTheDocument();
    expect(within(firstMilestone).getByText('Pro')).toBeInTheDocument();
    fireEvent.click(
        within(firstMilestone).getByText(
            'Preview with 40% of Pro users in Norway',
        ),
    );
    expect(strategyButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(
        within(firstMilestone).getByText(
            'Preview with 40% of Pro users in Norway',
        ),
    );
    expect(strategyButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_2')).getByRole(
            'button',
            { name: 'Start now' },
        ),
    );
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_2')).getByText(
            'Running',
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ENABLED_COUNT'),
    ).toHaveTextContent('4');
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'View strategy' },
        ),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_2')).getByRole(
            'button',
            { name: 'Hide strategy' },
        ),
    ).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'Start now' },
        ),
    );
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByText(
            'Running',
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ENABLED_COUNT'),
    ).toHaveTextContent('1');

    fireEvent.click(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_2')).getByRole(
            'button',
            { name: 'Start now' },
        ),
    );

    for (const [milestone, audience] of [
        [3, 18],
        [4, 20],
    ]) {
        act(() => {
            vi.advanceTimersByTime(6600);
        });
        expect(
            within(
                screen.getByTestId(`QUICK_TOUR_INTRO_MILESTONE_${milestone}`),
            ).getByText('Running'),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('QUICK_TOUR_INTRO_ENABLED_COUNT'),
        ).toHaveTextContent(String(audience));
    }

    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_MILESTONE_PROGRESS'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON')).toBeEnabled();
    vi.useRealTimers();
});

test('marks the tour finished on reaching the showcase and closes it on Finish', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const onFinish = vi.fn();
    renderAdvancedIntro({ onComplete, onFinish });

    next(); // target
    next(); // variants
    next(); // release plan
    completeReleasePlan();
    next(); // impact
    observeAndRecoverManually();
    next(); // safeguard
    retryWithSafeguard();
    next(); // showcase
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('QUICK_TOUR_INTRO_FINISH_BUTTON'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
});

test('targets with product-like country and plan constraints', () => {
    renderAdvancedIntro();
    next();

    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.queryByText('Device')).not.toBeInTheDocument();
    const norwayConstraint = screen.getByRole('button', { name: 'Norway' });
    expect(norwayConstraint).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(norwayConstraint);
    expect(norwayConstraint).toHaveAttribute('aria-pressed', 'false');
    expect(
        screen.getByRole('button', { name: 'Enterprise' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('is one of').length).toBeGreaterThanOrEqual(2);
});

test('explains targeting from the matching context values', () => {
    renderAdvancedIntro();
    next();

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getByRole('button', { name: /Ada/ }));

    const explanation = screen.getByText(/Ada (sees|matches)/);
    expect(explanation).toHaveTextContent(/Norway and the Pro plan/);
    expect(explanation).toHaveTextContent(/both constraints/);
    expect(screen.getByText('"NO"')).toBeInTheDocument();
    expect(screen.getByText('"Pro"')).toBeInTheDocument();

    const excludedByCountry = generateIntroUsers(20).find(
        (user) => !['NO', 'US'].includes(user.country.code),
    )!;
    fireEvent.click(
        within(grid).getByRole('button', {
            name: new RegExp(excludedByCountry.name),
        }),
    );
    expect(
        screen.getByText(
            new RegExp(
                `${excludedByCountry.name} doesn't see my-feature because ${excludedByCountry.country.label} is not one of the targeted countries`,
            ),
        ),
    ).toBeInTheDocument();
});

test('shows the evaluation details in the preview panel', () => {
    renderAdvancedIntro();
    next();

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getByRole('button', { name: /Ada/ }));

    const panel = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(within(panel).getByText('Feature enabled')).toBeInTheDocument();
    expect(within(panel).getByText('Context')).toBeInTheDocument();
    expect(within(panel).getByText('"NO"')).toBeInTheDocument();
});

test('links constraints to the activation strategy documentation', async () => {
    renderAdvancedIntro();
    next();

    const title = screen.getByTestId('QUICK_TOUR_INTRO_CONSTRAINTS_TITLE');
    fireEvent.mouseOver(within(title).getByLabelText('Help'));
    expect(
        await screen.findByText(/Every constraint on a strategy must match/),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('link', {
            name: 'Read more in the documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/activation-strategies#constraints',
    );
});

test('links variants to the strategy variants documentation', async () => {
    renderAdvancedIntro();
    next();
    next();

    const title = screen.getByTestId('QUICK_TOUR_INTRO_VARIANTS_TITLE');
    fireEvent.mouseOver(within(title).getByLabelText('Help'));
    expect(
        await screen.findByText(/Variants split enabled users/),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('link', {
            name: 'Read more in the documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/strategy-variants',
    );
});

test('names Impact Metrics and links to its documentation', async () => {
    vi.useFakeTimers();
    renderAdvancedIntro();
    next();
    next();
    next();
    completeReleasePlan();
    next();
    vi.useRealTimers();

    expect(screen.getAllByText('Impact metrics')).toHaveLength(1);
    const charts = screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS');
    fireEvent.mouseOver(within(charts).getByLabelText('Help'));
    expect(
        await screen.findByText(/Connect application data/),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('link', {
            name: 'Read more in the documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/impact-metrics',
    );
});

test('manages variants and previews the exact assigned experience', async () => {
    renderAdvancedIntro();
    next();
    next();

    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_VARIANT_SEGMENT_C'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('QUICK_TOUR_INTRO_ADD_VARIANT_BUTTON'));
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_VARIANT_SEGMENT_C'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('QUICK_TOUR_INTRO_ADD_VARIANT_BUTTON'));
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_VARIANT_SEGMENT_D'),
    ).toBeInTheDocument();
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_ADD_VARIANT_BUTTON'),
    ).not.toBeInTheDocument();
    fireEvent.mouseOver(
        screen.getByTestId('QUICK_TOUR_INTRO_VARIANT_SEGMENT_A'),
    );
    const payload = await screen.findByTestId(
        'QUICK_TOUR_INTRO_VARIANT_PAYLOAD',
    );
    expect(payload).toHaveTextContent('"placeholder": "Search by keyword"');
    expect(payload).toHaveTextContent('"accent":');

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getAllByRole('button')[0]);
    expect(screen.getByText(/Variant [ABCD] enabled/)).toBeInTheDocument();
    expect(
        screen.getByText(/Ada sees my-feature variant [ABCD] because/),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/Variant [ABCD] has a 25% allocation/),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/Ada's assignment stays sticky/),
    ).toBeInTheDocument();
    expect(
        screen.queryByTestId('QUICK_TOUR_INTRO_PAYLOAD'),
    ).not.toBeInTheDocument();
});

test('teaches manual recovery before a safeguard automates it', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    next();
    next();
    next();
    completeReleasePlan();
    next(); // impact

    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS')).getByText(
            '0',
        ),
    ).toBeInTheDocument();
    observeAndRecoverManually();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_MANUAL_RECOVERY'),
    ).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);

    next(); // safeguard
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    expect(screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON')).toBeEnabled();
    expect(screen.getAllByRole('button', { name: 'Start now' })).toHaveLength(
        4,
    );
    expect(
        screen
            .getByTestId('QUICK_TOUR_INTRO_RELEASE_PLAN')
            .contains(screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS')),
    ).toBe(true);
    expect(screen.getByText('errors')).toBeInTheDocument();
    expect(screen.getByText('exceeds')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('last minute')).toBeInTheDocument();
    expect(screen.getByText('Successful searches')).toBeInTheDocument();
    expect(screen.getByText('Threshold 2')).toBeInTheDocument();
    expect(screen.queryByText('Live')).not.toBeInTheDocument();
    expect(screen.queryByText(/Configured and ready/)).not.toBeInTheDocument();
    expect(screen.queryByText('filtered by')).not.toBeInTheDocument();
    expect(screen.queryByText('aggregated by')).not.toBeInTheDocument();
    expect(
        screen
            .getByTestId('QUICK_TOUR_INTRO_SAFEGUARD')
            .compareDocumentPosition(
                screen.getByText('Release plan:').parentElement!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.mouseOver(
        within(screen.getByTestId('QUICK_TOUR_INTRO_SAFEGUARD')).getByLabelText(
            'Help',
        ),
    );
    act(() => {
        vi.advanceTimersByTime(1_000);
    });
    expect(
        screen.getByRole('link', {
            name: 'Read more in the documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/guides/getting-started-release-management#configure-a-safeguard',
    );
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    expect(screen.queryByText('Monitoring')).not.toBeInTheDocument();
    expect(
        within(screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1')).getByRole(
            'button',
            { name: 'View strategy' },
        ),
    ).toHaveAttribute('aria-expanded', 'false');
    advanceLiveTraffic(8_100);
    expect(screen.queryByText('Monitoring')).not.toBeInTheDocument();
    expect(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    ).toBeChecked();
    const erroredPreview = screen
        .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
        .find((preview) => preview.getAttribute('data-experience') === 'error');
    expect(erroredPreview).toBeDefined();
    fireEvent.click(erroredPreview!.closest('button')!);
    advanceLiveTraffic(900);
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_AUTO_RECOVERY'),
    ).toHaveTextContent(/disabled production/);
    expect(screen.queryByText('Triggered')).not.toBeInTheDocument();
    expect(screen.queryByText(/Third error received/)).not.toBeInTheDocument();
    const safeguardEvents = within(
        screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS'),
    ).getAllByTestId('QUICK_TOUR_INTRO_EVENT_SAFEGUARD_DISABLED');
    expect(safeguardEvents).toHaveLength(2);
    safeguardEvents.forEach((event) => {
        expect(event).toHaveAttribute(
            'aria-label',
            'Safeguard disabled production',
        );
    });
    expect(
        within(
            screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS'),
        ).getAllByTestId('ToggleOffIcon'),
    ).toHaveLength(2);
    expect(
        within(
            screen.getByTestId('QUICK_TOUR_INTRO_IMPACT_CHARTS'),
        ).getAllByTestId('ShieldOutlinedIcon'),
    ).toHaveLength(2);
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_USER_STATUS')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);
    const recoveredPopover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(
        within(recoveredPopover).getByText('Feature disabled'),
    ).toBeInTheDocument();
    expect(
        within(recoveredPopover).queryByText('Feature error'),
    ).not.toBeInTheDocument();
    expect(
        screen
            .getByTestId('QUICK_TOUR_INTRO_USER_GRID')
            .compareDocumentPosition(
                screen.getByTestId('QUICK_TOUR_INTRO_AUTO_RECOVERY'),
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    ).not.toBeChecked();
    vi.useRealTimers();
}, 10000);

test('hands the idle nudge from the toggle to Next once production is on', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    act(() => {
        vi.advanceTimersByTime(3000);
    });
    expect(
        screen.getByText('Turn on my-feature in production'),
    ).toBeInTheDocument();
    expect(
        screen.queryByText('Click Next to continue'),
    ).not.toBeInTheDocument();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    act(() => {
        vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Click Next to continue')).toBeInTheDocument();
    vi.useRealTimers();
});

test('dragging the slider defers the Next nudge', () => {
    vi.useFakeTimers();
    renderAdvancedIntro();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle my-feature in production',
        }),
    );
    act(() => {
        vi.advanceTimersByTime(2500);
    });
    fireEvent.change(screen.getByRole('slider', { name: 'Rollout %' }), {
        target: { value: '70' },
    });
    act(() => {
        vi.advanceTimersByTime(2500);
    });
    expect(
        screen.queryByText('Click Next to continue'),
    ).not.toBeInTheDocument();
    act(() => {
        vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('Click Next to continue')).toBeInTheDocument();
    vi.useRealTimers();
});
