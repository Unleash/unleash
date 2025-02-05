import type { FC } from 'react';
import { ReactComponent as Stage1 } from 'assets/icons/lifecycle/stage-1.svg';
import { ReactComponent as Stage2 } from 'assets/icons/lifecycle/stage-2.svg';
import { ReactComponent as Stage3 } from 'assets/icons/lifecycle/stage-3.svg';
import { ReactComponent as Stage4 } from 'assets/icons/lifecycle/stage-4.svg';
import { ReactComponent as Stage5 } from 'assets/icons/lifecycle/stage-5.svg';
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage';

export const FeatureLifecycleStageIcon: FC<{
    stage: Pick<LifecycleStage, 'name'>;
}> = ({ stage, ...props }) => {
    if (stage.name === 'archived') {
        return <Stage5 {...props} />;
    }
    if (stage.name === 'pre-live') {
        return <Stage2 {...props} />;
    }
    if (stage.name === 'live') {
        return <Stage3 {...props} />;
    }
    if (stage.name === 'completed') {
        return <Stage4 {...props} />;
    }
    return <Stage1 {...props} />;
};
