import { Button, styled } from '@mui/material';
import type { Story, StoryMeta } from '../component/stories/types';

export const meta: StoryMeta = {
    title: 'Theme / Button',
    background: 'application',
};

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

export const Default: Story = () => (
    <Row>
        <Button variant='text'>Text</Button>
        <Button variant='outlined'>Outlined</Button>
        <Button variant='contained'>Contained</Button>
    </Row>
);

export const Small: Story = () => (
    <Row>
        <Button size='small' variant='text'>
            Text
        </Button>
        <Button size='small' variant='outlined'>
            Outlined
        </Button>
        <Button size='small' variant='contained'>
            Contained
        </Button>
    </Row>
);

export const Medium: Story = () => (
    <Row>
        <Button size='medium' variant='text'>
            Text
        </Button>
        <Button size='medium' variant='outlined'>
            Outlined
        </Button>
        <Button size='medium' variant='contained'>
            Contained
        </Button>
    </Row>
);

export const Large: Story = () => (
    <Row>
        <Button size='large' variant='text'>
            Text
        </Button>
        <Button size='large' variant='outlined'>
            Outlined
        </Button>
        <Button size='large' variant='contained'>
            Contained
        </Button>
    </Row>
);

export const Disabled: Story = () => (
    <Row>
        <Button disabled variant='text'>
            Text
        </Button>
        <Button disabled variant='outlined'>
            Outlined
        </Button>
        <Button disabled variant='contained'>
            Contained
        </Button>
    </Row>
);

const COLORS = [
    'primary',
    'secondary',
    'error',
    'warning',
    'info',
    'success',
] as const;

const Stack = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const XLColorsList: Story = () => (
    <Stack>
        {COLORS.map((color) => (
            <Row key={color}>
                <Button color={color} variant='text'>
                    {color} text
                </Button>
                <Button color={color} variant='outlined'>
                    {color} outlined
                </Button>
                <Button color={color} variant='contained'>
                    {color} contained
                </Button>
            </Row>
        ))}
    </Stack>
);
