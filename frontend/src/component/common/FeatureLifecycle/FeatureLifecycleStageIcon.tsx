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
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage';
import { useUiFlag } from 'hooks/useUiFlag';

export const FeatureLifecycleStageIcon: FC<{
    stage: Pick<LifecycleStage, 'name'>;
}> = ({ stage, ...props }) => {
    const newIcons = useUiFlag('lifecycleImprovements');

    if (stage.name === 'archived') {
        return newIcons ? (
            <Stage5 {...props} />
        ) : (
            <ArchivedStageIcon {...props} />
        );
    } else if (stage.name === 'pre-live') {
        return newIcons ? (
            <Stage2 {...props} />
        ) : (
            <PreLiveStageIcon {...props} />
        );
    } else if (stage.name === 'live') {
        return newIcons ? <Stage3 {...props} /> : <LiveStageIcon {...props} />;
    } else if (stage.name === 'completed') {
        return newIcons ? (
            <Stage4 {...props} />
        ) : (
            <CompletedStageIcon {...props} />
        );
    } else {
        return newIcons ? (
            <Stage1 {...props} />
        ) : (
            <InitialStageIcon {...props} />
        );
    }
};
