import { useState } from 'react';
import type { Story, StoryMeta } from 'component/stories/types';
import { ChooseEnvironment } from './ChooseEnvironment';

export const meta: StoryMeta = {
    title: 'Onboarding / ChooseEnvironment',
    background: 'paper',
};

export const Default: Story = () => {
    const [env, setEnv] = useState('production');
    return (
        <ChooseEnvironment
            environments={['production', 'development', 'staging']}
            environment={env}
            onSelect={setEnv}
        />
    );
};

export const LongName: Story = () => {
    const [env, setEnv] = useState('prod');
    return (
        <ChooseEnvironment
            environments={['prod', 'really-long-environment-name', 'staging']}
            environment={env}
            onSelect={setEnv}
        />
    );
};
