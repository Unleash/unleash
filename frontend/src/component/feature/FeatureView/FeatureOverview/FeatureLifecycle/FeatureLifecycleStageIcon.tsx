import type { FC } from 'react';
import { ReactComponent as InitialStageIcon } from 'assets/icons/stage-initial.svg';
import { ReactComponent as PreLiveStageIcon } from 'assets/icons/stage-pre-live.svg';
import { ReactComponent as LiveStageIcon } from 'assets/icons/stage-live.svg';
import { ReactComponent as CompletedStageIcon } from 'assets/icons/stage-completed.svg';
import { ReactComponent as ArchivedStageIcon } from 'assets/icons/stage-archived.svg';
import { ReactComponent as Stage1 } from 'assets/icons/lifecycle/stage-1.svg';
import { ReactComponent as Stage2 } from 'assets/icons/lifecycle/stage-2.svg';
import { ReactComponent as Stage3 } from 'assets/icons/lifecycle/stage-3.svg';
import { ReactComponent as Stage4 } from 'assets/icons/lifecycle/stage-4.svg';
import { ReactComponent as Stage5 } from 'assets/icons/lifecycle/stage-5.svg';
import type { LifecycleStage } from './LifecycleStage';
import { useUiFlag } from 'hooks/useUiFlag';

export const FeatureLifecycleStageIcon: FC<{
    stage: Pick<LifecycleStage, 'name'>;
}> = ({ stage }) => {
    const newIcons = useUiFlag('lifecycleImprovements');

    if (stage.name === 'archived') {
        return newIcons ? <Stage5 /> : <ArchivedStageIcon />;
    } else if (stage.name === 'pre-live') {
        return newIcons ? <Stage2 /> : <PreLiveStageIcon />;
    } else if (stage.name === 'live') {
        return newIcons ? <Stage3 /> : <LiveStageIcon />;
    } else if (stage.name === 'completed') {
        return newIcons ? <Stage4 /> : <CompletedStageIcon />;
    } else {
        return newIcons ? <Stage1 /> : <InitialStageIcon />;
    }
};
