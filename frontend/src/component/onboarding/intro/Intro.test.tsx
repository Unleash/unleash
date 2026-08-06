import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { Intro } from './Intro.tsx';

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
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
        }),
    );
    act(() => {
        vi.advanceTimersByTime(3600);
    });
    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
        }),
    );
    advanceLiveTraffic(9_500);
};

test('starts with a gradual Smart Search rollout and context cards', () => {
    renderAdvancedIntro();

    expect(screen.getByText('Release Smart Search')).toBeInTheDocument();
    expect(screen.getByText(/people get Smart Search/)).toBeInTheDocument();
    expect(
        screen.getByText(
            /Each card previews the experience that person receives in real time/,
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByText('of 15 people get Smart Search'),
    ).not.toHaveTextContent('%');
    expect(screen.queryByText('Controlled release')).not.toBeInTheDocument();
    expect(screen.queryByText('Release')).not.toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID'),
    ).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .filter(
                (preview) => preview.getAttribute('data-device') === 'mobile',
            ),
    ).toHaveLength(6);

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getAllByRole('button')[0]);
    const popover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(popover).toHaveStyle({ overflow: 'hidden' });
    expect(screen.getByTestId('QUICK_TOUR_INTRO_POPOVER_BODY')).toHaveStyle({
        overflowY: 'auto',
    });
    expect(Number(popover.dataset.maxHeight)).toBeLessThan(window.innerHeight);
    expect(screen.getByText('Classic Search')).toBeInTheDocument();
    expect(screen.getByText('Current experience')).toBeInTheDocument();
    expect(screen.getByText('Context')).toBeInTheDocument();
    expect(
        screen.getByText(
            /Ada sees Classic Search because the rollout does not include their bucket \(0 < \d+\)/,
        ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Rollout %' }), {
        target: { value: '100' },
    });
    expect(screen.getByText('✦ Smart Search')).toBeInTheDocument();
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'smart',
            ),
    ).toBe(true);
    expect(
        screen.getByText(
            /Ada gets Smart Search because the rollout includes their bucket \(100 ≥ \d+\)/,
        ),
    ).toBeInTheDocument();
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
    expect(screen.getByText('Target the right audience')).toBeInTheDocument();

    next();
    expect(screen.getByText('Compare experiences')).toBeInTheDocument();

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
            name: 'Toggle Smart Search in production',
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
    expect(screen.getByText('This was just a glimpse')).toBeInTheDocument();
    expect(
        screen.getAllByTestId('QUICK_TOUR_INTRO_SHOWCASE_CARD'),
    ).toHaveLength(9);
    expect(
        screen.getByRole('link', {
            name: 'Change requests documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/change-requests',
    );
    expect(
        screen.getByRole('link', {
            name: 'Feature lifecycle documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/feature-flags#feature-flag-lifecycle',
    );
    expect(
        screen.getByRole('link', {
            name: 'Enterprise Edge documentation',
        }),
    ).toHaveAttribute('href', 'https://docs.getunleash.io/unleash-edge');
    expect(
        screen.getByRole('link', {
            name: 'Access management documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/guides/user-management-access-controls',
    );
    expect(
        screen.getByRole('link', {
            name: 'Impact metrics & safeguards documentation',
        }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/concepts/impact-metrics',
    );
    expect(screen.getByTestId('QUICK_TOUR_INTRO_CONFETTI')).toBeInTheDocument();
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

    expect(screen.getByText('Unleash Intro · 1 of 3')).toBeInTheDocument();
    next();
    next();
    expect(screen.getByText('Compare experiences')).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_NEXT_BUTTON'),
    ).toHaveTextContent('Finish');

    next();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('QUICK_TOUR_INTRO_SHOWCASE')).toBeInTheDocument();
    expect(screen.queryByText('Automate the rollout')).not.toBeInTheDocument();
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
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
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
            name: 'Toggle Smart Search in production',
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
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .filter(
                (preview) =>
                    preview.getAttribute('data-experience') === 'error',
            ),
    ).toHaveLength(0);

    advanceLiveTraffic(1700);
    const errorPreviews = screen
        .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
        .filter(
            (preview) => preview.getAttribute('data-experience') === 'error',
        );
    expect(errorPreviews).toHaveLength(1);
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC_VALUE'),
    ).toHaveTextContent(`${errorPreviews.length}`);
    expect(screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC')).toHaveAttribute(
        'data-max',
        '15',
    );

    const firstErroredCard = errorPreviews[0].closest('button')!;
    advanceLiveTraffic(5400);
    expect(
        within(firstErroredCard).getByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW'),
    ).toHaveAttribute('data-experience', 'error');
    const milestoneEvents = within(charts).getAllByTestId(
        'QUICK_TOUR_INTRO_EVENT_MILESTONE',
    );
    expect(milestoneEvents).toHaveLength(2);
    milestoneEvents.forEach((event) => {
        expect(event).toHaveAttribute(
            'aria-label',
            'Milestone started: Expand to 60% of Free + Pro desktop users',
        );
    });
    expect(within(charts).getAllByTestId('FlagOutlinedIcon')).toHaveLength(2);

    fireEvent.click(firstErroredCard);
    const popover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(
        within(popover).getByTestId('QUICK_TOUR_INTRO_ERROR_PREVIEW'),
    ).toBeInTheDocument();
    expect(within(popover).getByText('✦ Smart Search')).toBeInTheDocument();
    expect(within(popover).getByText('Search error')).toBeInTheDocument();
    expect(
        within(popover).getByText(/Smart Search returned an error/),
    ).toBeInTheDocument();
    expect(
        within(popover).queryByText('Current experience'),
    ).not.toBeInTheDocument();

    advanceLiveTraffic(18_000);
    expect(
        screen
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .filter(
                (preview) =>
                    preview.getAttribute('data-experience') === 'error',
            ),
    ).toHaveLength(15);
    expect(
        screen.getByTestId('QUICK_TOUR_INTRO_ERROR_METRIC_VALUE'),
    ).toHaveTextContent('15');
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
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
        }),
    ).toBeChecked();

    fireEvent.click(
        screen.getByRole('switch', {
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
        }),
    );

    const firstMilestone = screen.getByTestId('QUICK_TOUR_INTRO_MILESTONE_1');
    const strategyButton = within(firstMilestone).getByRole('button', {
        name: 'Hide strategy',
    });
    expect(strategyButton).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstMilestone).getByText('Plan')).toBeInTheDocument();
    expect(within(firstMilestone).getByText('🥉 Free')).toBeInTheDocument();
    fireEvent.click(
        within(firstMilestone).getByText(
            'Preview with 40% of Free desktop users',
        ),
    );
    expect(strategyButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(
        within(firstMilestone).getByText(
            'Preview with 40% of Free desktop users',
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
        [3, 7],
        [4, 15],
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

test('targets with product-like country, plan, and device constraints', () => {
    renderAdvancedIntro();
    next();

    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    const norwayConstraint = screen.getByRole('button', { name: '🇳🇴 NO' });
    expect(norwayConstraint).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(norwayConstraint);
    expect(norwayConstraint).toHaveAttribute('aria-pressed', 'false');
    expect(
        screen.getByRole('button', { name: '🥇 Enterprise' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('is one of').length).toBeGreaterThanOrEqual(3);
});

test('explains targeting from the matching context values', () => {
    renderAdvancedIntro();
    next();

    const grid = screen.getByTestId('QUICK_TOUR_INTRO_USER_GRID');
    fireEvent.click(within(grid).getByRole('button', { name: /Ada/ }));

    const explanation = screen.getByText(/Ada (gets|matches)/);
    expect(explanation).toHaveTextContent(/Norway, the Pro plan, and desktop/);
    expect(explanation).toHaveTextContent(/all three constraints/);
    expect(screen.getByText('"🇳🇴 NO"')).toBeInTheDocument();
    expect(screen.getByText('"🥈 Pro"')).toBeInTheDocument();
    expect(screen.getByText('"🖥️ Desktop"')).toBeInTheDocument();

    fireEvent.click(within(grid).getByRole('button', { name: /Ben/ }));
    expect(
        screen.getByText(
            /Ben sees Classic Search because Free is not one of the targeted plans/,
        ),
    ).toBeInTheDocument();
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

    expect(screen.getAllByText('Impact metrics')).toHaveLength(2);
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
    expect(screen.getByText('✦ Smart Search')).toBeInTheDocument();
    const searchInput = screen.getByTestId('QUICK_TOUR_INTRO_SEARCH_INPUT');
    expect(
        within(searchInput).getByText(
            /Search by keyword|Ask any question|Find products, docs, or people|What would you like to find?/,
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/Ada gets the .+ variant \([ABCD]\) because/),
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
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
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
            name: 'Toggle Smart Search in production',
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
            name: 'Toggle Smart Search in production',
        }),
    ).toBeChecked();
    const erroredPreview = screen
        .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
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
            .getAllByTestId('QUICK_TOUR_INTRO_MINI_PREVIEW')
            .every(
                (preview) =>
                    preview.getAttribute('data-experience') === 'classic',
            ),
    ).toBe(true);
    const recoveredPopover = screen.getByTestId('QUICK_TOUR_INTRO_POPOVER');
    expect(
        within(recoveredPopover).getByText('Classic Search'),
    ).toBeInTheDocument();
    expect(
        within(recoveredPopover).queryByText('Search error'),
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
            name: 'Toggle Smart Search in production',
        }),
    ).not.toBeChecked();
    vi.useRealTimers();
}, 10000);

test('closes the tour on Skip without marking it finished', () => {
    const onComplete = vi.fn();
    const onFinish = vi.fn();
    renderAdvancedIntro({ onComplete, onFinish });

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
});
