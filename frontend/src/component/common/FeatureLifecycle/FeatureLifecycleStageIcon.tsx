import type { FC } from 'react';
import { ReactComponent as CreatedIcon } from 'assets/icons/lifecycle/stage-created.svg';
import { ReactComponent as PreLiveIcon } from 'assets/icons/lifecycle/stage-prelive.svg';
import { ReactComponent as LiveIcon } from 'assets/icons/lifecycle/stage-live.svg';
import { ReactComponent as CompletedIcon } from 'assets/icons/lifecycle/stage-completed.svg';
import { ReactComponent as ArchivedIcon } from 'assets/icons/lifecycle/stage-archived.svg';
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
