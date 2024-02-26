import { Box, styled } from '@mui/material';
import { IFeatureStrategyParameters } from 'interfaces/strategy';
import RolloutSlider from '../RolloutSlider/RolloutSlider';
import Input from 'component/common/Input/Input';
import {
    FLEXIBLE_STRATEGY_GROUP_ID,
    FLEXIBLE_STRATEGY_STICKINESS_ID,
} from 'utils/testIds';
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

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

const StyledOuterBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(1),
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
}));

const StyledInnerBox1 = styled(Box)(({ theme }) => ({
    width: '50%',
    marginRight: theme.spacing(0.5),
}));

const StyledInnerBox2 = styled(Box)(({ theme }) => ({
    width: '50%',
    marginLeft: theme.spacing(0.5),
}));

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
        <StyledBox>
            <RolloutSlider
                name='Rollout'
                value={rollout}
                disabled={!editable}
                onChange={updateRollout}
            />
            <StyledOuterBox>
                <StyledInnerBox1>
                    <StickinessSelect
                        label='Stickiness'
                        value={stickiness}
                        editable={editable}
                        dataTestId={FLEXIBLE_STRATEGY_STICKINESS_ID}
                        onChange={(e) => onUpdate('stickiness')(e.target.value)}
                    />
                </StyledInnerBox1>
                <StyledInnerBox2>
                    <Input
                        label='groupId'
                        sx={{ width: '100%' }}
                        id='groupId-input'
                        value={parseParameterString(parameters.groupId)}
                        disabled={!editable}
                        onChange={(e) => onUpdate('groupId')(e.target.value)}
                        data-testid={FLEXIBLE_STRATEGY_GROUP_ID}
                    />
                </StyledInnerBox2>
            </StyledOuterBox>
        </StyledBox>
    );
};

export default FlexibleStrategy;
