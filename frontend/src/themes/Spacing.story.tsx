import { styled, useTheme } from '@mui/material';
import type { Story, StoryMeta } from '../component/stories/types';

export const meta: StoryMeta = {
    title: 'Theme / Spacing',
    background: 'application',
};

const SPACING_VALUES = [
    0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64,
];

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const Label = styled('div')(({ theme }) => ({
    fontFamily: 'monospace',
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    minWidth: 180,
    display: 'flex',
    gap: theme.spacing(1),
}));

const Resolved = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
}));

const Bar = styled('div')(({ theme }) => ({
    height: 20,
    background: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusSmall,
    minWidth: 1,
}));

export const Values: Story = () => {
    const theme = useTheme();
    return (
        <Container>
            {SPACING_VALUES.map((n) => {
                const value = theme.spacing(n);
                return (
                    <Row key={n}>
                        <Label>
                            <span>spacing({n})</span>
                            <Resolved>= {value}</Resolved>
                        </Label>
                        <Bar style={{ width: value }} />
                    </Row>
                );
            })}
        </Container>
    );
};
