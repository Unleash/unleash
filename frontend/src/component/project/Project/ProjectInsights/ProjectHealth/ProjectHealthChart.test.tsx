import '@testing-library/jest-dom';
import { ProjectHealthChart } from './ProjectHealthChart';
import { render } from '../../../../../utils/testRenderer';
import { screen } from '@testing-library/react';

describe('ProjectHealthChart', () => {
    test('renders correctly with no flags', () => {
        const { container } = render(
            <ProjectHealthChart
                active={0}
                stale={0}
                potentiallyStale={0}
                health={0}
            />,
        );

        const activeCircle = container.querySelector(
            'circle[data-testid="active-circle"]',
        );
        const staleCircle = container.querySelector(
            'circle[data-testid="stale-circle"]',
        );
        const potentiallyStaleCircle = container.querySelector(
            'circle[data-testid="potentially-stale-circle"]',
        );

        expect(activeCircle).toBeInTheDocument();
        expect(staleCircle).not.toBeInTheDocument();
        expect(potentiallyStaleCircle).not.toBeInTheDocument();
    });

    test('renders correctly with 1 active and 0 stale', () => {
        const { container } = render(
            <ProjectHealthChart
                active={1}
                stale={0}
                potentiallyStale={0}
                health={100}
            />,
        );

        const activeCircle = container.querySelector(
            'circle[data-testid="active-circle"]',
        );
        const staleCircle = container.querySelector(
            'circle[data-testid="stale-circle"]',
        );
        const potentiallyStaleCircle = container.querySelector(
            'circle[data-testid="potentially-stale-circle"]',
        );

        expect(activeCircle).toBeInTheDocument();
        expect(staleCircle).not.toBeInTheDocument();
        expect(potentiallyStaleCircle).not.toBeInTheDocument();
    });

    test('renders correctly with 0 active and 1 stale', () => {
        const { container } = render(
            <ProjectHealthChart
                active={0}
                stale={1}
                potentiallyStale={0}
                health={0}
            />,
        );

        const staleCircle = container.querySelector(
            'circle[data-testid="stale-circle"]',
        );

        expect(staleCircle).toBeInTheDocument();
    });

    test('renders correctly with active, stale and potentially stale', () => {
        const { container } = render(
            <ProjectHealthChart
                active={2}
                stale={1}
                potentiallyStale={1}
                health={50}
            />,
        );

        const activeCircle = container.querySelector(
            'circle[data-testid="active-circle"]',
        );
        const staleCircle = container.querySelector(
            'circle[data-testid="stale-circle"]',
        );
        const potentiallyStaleCircle = container.querySelector(
            'circle[data-testid="potentially-stale-circle"]',
        );

        expect(activeCircle).toBeInTheDocument();
        expect(staleCircle).toBeInTheDocument();
        expect(potentiallyStaleCircle).toBeInTheDocument();
    });

    test('renders flags count and health', () => {
        const { container } = render(
            <ProjectHealthChart
                active={2}
                stale={1}
                potentiallyStale={1}
                health={50}
            />,
        );

        expect(screen.queryByText('3 flags')).toBeInTheDocument();
        expect(screen.queryByText('50%')).toBeInTheDocument();
    });

    test('renders small values without negative stroke dasharray', () => {
        const { container } = render(
            <ProjectHealthChart
                active={1000}
                stale={1}
                potentiallyStale={1}
                health={50}
            />,
        );

        const activeCircle = container.querySelector(
            'circle[data-testid="active-circle"]',
        );
        const staleCircle = container.querySelector(
            'circle[data-testid="stale-circle"]',
        );
        const potentiallyStaleCircle = container.querySelector(
            'circle[data-testid="potentially-stale-circle"]',
        );

        expect(
            activeCircle?.getAttribute('stroke-dasharray')?.charAt(0),
        ).not.toBe('-');
        expect(
            staleCircle?.getAttribute('stroke-dasharray')?.charAt(0),
        ).not.toBe('-');
        expect(
            potentiallyStaleCircle?.getAttribute('stroke-dasharray')?.charAt(0),
        ).not.toBe('-');
    });
});
