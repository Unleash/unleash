import { useState } from 'react';
import type { Story, StoryMeta } from 'component/stories/types';
import { allSdks, type SdkName } from 'component/onboarding/dialog/sharedTypes';
import { SelectSdk } from './SelectSdk';

export const meta: StoryMeta = {
    title: 'Onboarding/ImplementFlagDialog/SelectSdk',
    background: 'paper',
};

const allSdkNames = allSdks.map((sdk) => sdk.name);

const Controlled = ({
    projectSdks,
    initial,
}: {
    projectSdks: SdkName[];
    initial: SdkName;
}) => {
    const [value, setValue] = useState<SdkName>(initial);
    return (
        <SelectSdk
            projectSdks={projectSdks}
            value={value}
            onChange={setValue}
        />
    );
};

export const NoProjectSdks: Story = () => (
    <Controlled projectSdks={[]} initial={allSdks[0].name} />
);

export const OneProjectSdk: Story = () => (
    <Controlled projectSdks={['Python']} initial='Python' />
);

export const SomeProjectSdks: Story = () => (
    <Controlled projectSdks={['Node.js', 'Go']} initial='Node.js' />
);

export const AllSdksAreProjectSdks: Story = () => (
    <Controlled projectSdks={allSdkNames} initial={allSdkNames[0]} />
);
