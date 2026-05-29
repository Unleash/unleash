import { useState } from 'react';
import type { Story, StoryMeta } from 'component/stories/types';
import { allSdks, type SdkName } from 'component/onboarding/dialog/sharedTypes';
import { SelectSdk } from './SelectSdk';

export const meta: StoryMeta = {
    title: 'Onboarding/ImplementFlagDialog/SelectSdk',
    background: 'paper',
};

const Controlled = ({ initial }: { initial: SdkName }) => {
    const [value, setValue] = useState<SdkName>(initial);
    return <SelectSdk value={value} onChange={(sdk) => sdk && setValue(sdk)} />;
};

export const Default: Story = () => <Controlled initial={allSdks[0].name} />;
