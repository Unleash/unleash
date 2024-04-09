import theme from 'themes/theme';
import { screen } from '@testing-library/react';
import { useDefaultColumnVisibility } from './useDefaultColumnVisibility';
import { render } from 'utils/testRenderer';
import { ThemeProvider } from 'themes/ThemeProvider';

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

type TestComponentProps = {
    screenWidth: number;
};

const TestComponent: React.FC<TestComponentProps> = ({
    screenWidth,
}: TestComponentProps) => {
    const columns = useDefaultColumnVisibility(columnIds);

    return (
        <ThemeProvider>
            <div
                data-testid='wrapper'
                style={{
                    maxWidth: screenWidth,
                }}
            >
                {columns.toString()}
            </div>
        </ThemeProvider>
    );
};

test.each(Object.keys(theme.breakpoints.values))(
    'it renders all envs on %s screens',
    (screenSize) => {
        render(
            <TestComponent
                screenWidth={
                    theme.breakpoints.values[
                        screenSize as keyof typeof theme.breakpoints.values
                    ]
                }
            />,
        );

        const allEnvs = columnIds.filter((column) =>
            column.startsWith('environment:'),
        );

        for (const env of allEnvs) {
            screen.getByText(env);
        }
    },
);
