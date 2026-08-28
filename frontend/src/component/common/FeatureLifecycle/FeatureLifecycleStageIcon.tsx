import type { FC } from 'react';
import CreatedIcon from 'assets/icons/lifecycle/stage-created.svg?react';
import PreLiveIcon from 'assets/icons/lifecycle/stage-prelive.svg?react';
import LiveIcon from 'assets/icons/lifecycle/stage-live.svg?react';
import CompletedIcon from 'assets/icons/lifecycle/stage-completed.svg?react';
import ArchivedIcon from 'assets/icons/lifecycle/stage-archived.svg?react';
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';

export const FeatureLifecycleStageIcon: FC<{
    stage: Pick<LifecycleStage, 'name'>;
}> = ({ stage, ...props }) => {
    if (stage.name === 'archived') {
        return <ArchivedIcon {...props} />;
    }
    if (stage.name === 'pre-live') {
        return <PreLiveIcon {...props} />;
    }
    if (stage.name === 'live') {
        return <LiveIcon {...props} />;
    }
    if (stage.name === 'completed') {
        return <CompletedIcon {...props} />;
    }
    return <CreatedIcon {...props} />;
};
