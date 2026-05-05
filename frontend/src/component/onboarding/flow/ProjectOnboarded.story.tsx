import type { Story, StoryMeta } from 'component/stories/types';
import { ProjectOnboarded } from './ProjectOnboarded';

export const meta: StoryMeta = {
    title: 'Onboarding / ProjectOnboarded',
    background: 'application',
};

export const Default: Story = () => (
    <ProjectOnboarded projectId='my-project' onClose={() => {}} />
);
