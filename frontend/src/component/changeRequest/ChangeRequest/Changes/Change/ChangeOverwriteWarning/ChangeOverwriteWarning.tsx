import {
    ChangeRequestState,
    IChangeRequestPatchVariant,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useChangeRequestPlausibleContext } from 'component/changeRequest/ChangeRequestContext';
import { useUiFlag } from 'hooks/useUiFlag';
import { IFeatureVariant } from 'interfaces/featureToggle';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import { useEffect } from 'react';
import { OverwriteWarning } from './OverwriteWarning';
import {
    getEnvVariantChangesThatWouldBeOverwritten,
    getSegmentChangesThatWouldBeOverwritten,
    getStrategyChangesThatWouldBeOverwritten,
} from './strategy-change-diff-calculation';

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
          change: IChangeRequestUpdateStrategy;
      };

export const ChangeOverwriteWarning: React.FC<{
    data: ChangeData;
    changeRequestState: ChangeRequestState;
}> = ({ data, changeRequestState }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    if (!checkForChanges) {
        return null;
    }

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

export const EnvVariantChangesToOverwrite: React.FC<{
    currentVariants?: IFeatureVariant[];
    change: IChangeRequestPatchVariant;
    changeRequestState: ChangeRequestState;
}> = ({ change, currentVariants, changeRequestState }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getEnvVariantChangesThatWouldBeOverwritten(currentVariants, change)
        : null;

    return (
        <OverwriteWarning
            changeRequestState={changeRequestState}
            changeType='environment variant configuration'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};

export const SegmentChangesToOverwrite: React.FC<{
    currentSegment?: ISegment;
    change: IChangeRequestUpdateSegment;
    changeRequestState: ChangeRequestState;
}> = ({ change, currentSegment, changeRequestState }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getSegmentChangesThatWouldBeOverwritten(currentSegment, change)
        : null;

    return (
        <OverwriteWarning
            changeRequestState={changeRequestState}
            changeType='segment'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};

export const StrategyChangesToOverwrite: React.FC<{
    currentStrategy?: IFeatureStrategy;
    change: IChangeRequestUpdateStrategy;
    changeRequestState: ChangeRequestState;
}> = ({ change, currentStrategy, changeRequestState }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getStrategyChangesThatWouldBeOverwritten(currentStrategy, change)
        : null;
    const { registerWillOverwriteStrategyChanges } =
        useChangeRequestPlausibleContext();

    useEffect(() => {
        if (changesThatWouldBeOverwritten) {
            registerWillOverwriteStrategyChanges();
        }
    }, [changesThatWouldBeOverwritten]);

    return (
        <OverwriteWarning
            changeRequestState={changeRequestState}
            changeType='strategy'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};
