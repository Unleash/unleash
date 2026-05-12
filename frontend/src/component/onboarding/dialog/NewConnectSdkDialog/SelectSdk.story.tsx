import type { Story, StoryMeta } from 'component/stories/types';
import { SelectSdk } from './SelectSdk';

export const meta: StoryMeta = {
    title: 'Onboarding / SelectSdk',
    background: 'paper',
};

export const Default: Story = () => (
    <SelectSdk onSelect={(sdk) => console.log('Selected SDK:', sdk)} />
);

export const WithSelection: Story = () => (
    <SelectSdk
        sdk={{ name: 'Node.js', type: 'client' }}
        onSelect={(sdk) => console.log('Selected SDK:', sdk)}
    />
);
