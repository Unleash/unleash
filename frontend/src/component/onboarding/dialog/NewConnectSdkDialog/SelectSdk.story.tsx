import type { Story, StoryMeta } from 'component/stories/types';
import { SelectSdk } from './SelectSdk';

export const meta: StoryMeta = {
    title: 'Onboarding / SelectSdk',
    background: 'paper',
};

export const WithSelection: Story = () => (
    <SelectSdk onSelect={(sdk) => console.log('Selected SDK:', sdk)} />
);
