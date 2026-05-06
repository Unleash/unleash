import type { Story, StoryMeta } from 'component/stories/types';
import { NudgeLightbulb } from './NudgeLightbulb';

export const meta: StoryMeta = {
    title: 'Common / NudgeLightbulb',
    background: 'paper',
};

export const Default: Story = () => <NudgeLightbulb />;

export const InlineWithText: Story = () => (
    <span style={{ display: 'flex', alignItems: 'center' }}>
        View key concepts
        <NudgeLightbulb />
    </span>
);
