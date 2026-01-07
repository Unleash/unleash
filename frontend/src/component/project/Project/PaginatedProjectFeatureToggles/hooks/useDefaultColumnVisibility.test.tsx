import theme from 'themes/theme';
import { screen } from '@testing-library/react';
import { useDefaultColumnVisibility } from './useDefaultColumnVisibility.ts';
import { render } from 'utils/testRenderer';
import { ThemeProvider } from 'themes/ThemeProvider';
import { resizeScreen } from 'utils/resizeScreen';

const columnIds = [
    'select',
    'favorite',
    'name',
    'createdAt',
    'lastSeenAt',
    'environment:development',
    'environment:production',
    'environment:dev2',
    'environment:prod2',
    'environment:staging',
    'environment:test',
    'actions',
];

const TestComponent: React.FC = () => {
    const columns = useDefaultColumnVisibility(columnIds);

    return (
        <ThemeProvider>
            <ul data-testid='wrapper'>
                {Object.keys(columns).map((column) => (
                    <li key={column}>{column}</li>
                ))}
            </ul>
        </ThemeProvider>
    );
};

test.each(
    Object.keys(theme.breakpoints.values),
)('it renders all envs on %s screens', (screenSize) => {
    resizeScreen(
        theme.breakpoints.values[
            screenSize as keyof typeof theme.breakpoints.values
        ] + 1,
    );
    render(<TestComponent />);

    const allEnvs = columnIds.filter((column) =>
        column.startsWith('environment:'),
    );

    for (const env of allEnvs) {
        screen.getByText(env);
    }
});
