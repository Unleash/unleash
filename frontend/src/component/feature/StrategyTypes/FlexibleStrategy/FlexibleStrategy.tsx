import { Typography } from '@mui/material';
import { IFeatureStrategyParameters } from 'interfaces/strategy';
import RolloutSlider from '../RolloutSlider/RolloutSlider';
import Input from 'component/common/Input/Input';
import {
    FLEXIBLE_STRATEGY_GROUP_ID,
    FLEXIBLE_STRATEGY_STICKINESS_ID,
} from 'utils/testIds';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import {
    parseParameterNumber,
    parseParameterString,
} from 'utils/parseParameter';
import { StickinessSelect } from './StickinessSelect/StickinessSelect';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import Loader from '../../../common/Loader/Loader';
import { useEffect, useMemo } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLocation } from 'react-router';

interface IFlexibleStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    context: any;
    editable: boolean;
}

const FlexibleStrategy = ({
    updateParameter,
    parameters,
    editable = true,
}: IFlexibleStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { defaultStickiness, loading } = useDefaultProjectSettings(projectId);
    const { pathname } = useLocation();

    const isDefaultStrategyEdit = pathname.includes('default-strategy');
    const onUpdate = (field: string) => (newValue: string) => {
        updateParameter(field, newValue);
    };

    const updateRollout = (e: Event, value: number | number[]) => {
        updateParameter('rollout', value.toString());
    };

    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;

    const stickiness = useMemo(() => {
        if (parameters.stickiness === '' && !loading) {
            return defaultStickiness;
        }

        return parseParameterString(parameters.stickiness);
    }, [loading, parameters.stickiness]);

    if (parameters.stickiness === '') {
        onUpdate('stickiness')(stickiness);
    }

    useEffect(() => {
        if (isDefaultStrategyEdit && !parameters.groupId) {
            onUpdate('groupId')('');
        }
    }, [isDefaultStrategyEdit]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <RolloutSlider
                name="Rollout"
                value={rollout}
                disabled={!editable}
                onChange={updateRollout}
            />

            <br />
            <div>
                <Typography
                    variant="subtitle2"
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '1ch',
                    }}
                    component="h2"
                >
                    Stickiness
                    <HelpIcon tooltip="Stickiness defines what parameter should be used to ensure that your users get consistency in features. By default unleash will use the first value present in the context in the order of userId, sessionId and random." />
                </Typography>
                <StickinessSelect
                    label="Stickiness"
                    value={stickiness}
                    editable={editable}
                    dataTestId={FLEXIBLE_STRATEGY_STICKINESS_ID}
                    onChange={e => onUpdate('stickiness')(e.target.value)}
                />
                &nbsp;
                <br />
                <br />
                <Typography
                    variant="subtitle2"
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '1ch',
                    }}
                    component="h2"
                >
                    GroupId
                    <HelpIcon tooltip="GroupId is used to ensure that different toggles will hash differently for the same user. The groupId defaults to feature toggle name, but you can override it to correlate rollout of multiple feature toggles." />
                </Typography>
                <Input
                    label="groupId"
                    id="groupId-input"
                    value={parseParameterString(parameters.groupId)}
                    disabled={!editable}
                    onChange={e => onUpdate('groupId')(e.target.value)}
                    data-testid={FLEXIBLE_STRATEGY_GROUP_ID}
                />
            </div>
        </div>
    );
};

export default FlexibleStrategy;
