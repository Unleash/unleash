import type {
    ChangeRequestState,
    IChangeRequestPatchVariant,
    IChangeRequestUpdateMilestoneStrategy,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import type { IFeatureVariant } from 'interfaces/featureToggle';
import type { ISegment } from 'interfaces/segment';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { OverwriteWarning } from './OverwriteWarning.tsx';
import {
    getEnvVariantChangesThatWouldBeOverwritten,
    getSegmentChangesThatWouldBeOverwritten,
    getStrategyChangesThatWouldBeOverwritten,
} from './strategy-change-diff-calculation.ts';

type ChangeData =
    | {
          changeType: 'environment variant configuration';
          current?: IFeatureVariant[];
          change: IChangeRequestPatchVariant;
      }
    | {
          changeType: 'segment';
          current?: ISegment;
          change: IChangeRequestUpdateSegment;
      }
    | {
          changeType: 'strategy';
          current?: IFeatureStrategy;
          change:
              | IChangeRequestUpdateStrategy
              | IChangeRequestUpdateMilestoneStrategy;
      };

export const ChangeOverwriteWarning: React.FC<{
    data: ChangeData;
    changeRequestState: ChangeRequestState;
}> = ({ data, changeRequestState }) => {
    const getChangesThatWouldBeOverwritten = () => {
        switch (data.changeType) {
            case 'segment':
                return getSegmentChangesThatWouldBeOverwritten(
                    data.current,
                    data.change,
                );
            case 'strategy':
                return getStrategyChangesThatWouldBeOverwritten(
                    data.current,
                    data.change,
                );
            case 'environment variant configuration':
                return getEnvVariantChangesThatWouldBeOverwritten(
                    data.current,
                    data.change,
                );
        }
    };

    return (
        <OverwriteWarning
            changeRequestState={changeRequestState}
            changeType={data.changeType}
            changesThatWouldBeOverwritten={getChangesThatWouldBeOverwritten()}
        />
    );
};
