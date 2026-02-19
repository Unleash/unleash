import { useEffect, useMemo } from 'react';
import { Box, styled } from '@mui/material';
import type { IFeatureStrategyParameters } from 'interfaces/strategy';
import ConditionalRolloutSlider from '../RolloutSlider/ConditionalRolloutSlider.tsx';
import Input from 'component/common/Input/Input';
import {
    FLEXIBLE_STRATEGY_GROUP_ID,
    FLEXIBLE_STRATEGY_STICKINESS_ID,
} from 'utils/testIds';
import {
    parseParameterNumber,
    parseParameterString,
} from 'utils/parseParameter';
import { StickinessSelect } from './StickinessSelect/StickinessSelect.tsx';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import Loader from '../../../common/Loader/Loader.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { useLocation } from 'react-router';
import type { IFormErrors } from 'hooks/useFormErrors';

interface IFlexibleStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
    errors?: IFormErrors;
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
    errors,
}: IFlexibleStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useOptionalPathParam('featureId');
    const { defaultStickiness, loading } = useDefaultProjectSettings(projectId);
    const { pathname } = useLocation();

    const isDefaultStrategyEdit = pathname.includes('default-strategy');

    const updateRollout = (_e: Event, value: number | number[]) => {
        updateParameter('rollout', value.toString());
    };

    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;

    const stickiness = useMemo(() => {
        if (!parameters.stickiness && !loading) {
            updateParameter('stickiness', defaultStickiness);
        }

        return parseParameterString(parameters.stickiness);
    }, [loading, defaultStickiness, parameters.stickiness]);

    useEffect(() => {
        if (!parameters.groupId && !loading) {
            if (isDefaultStrategyEdit || !featureId) {
                updateParameter('groupId', '');
            } else {
                updateParameter('groupId', featureId);
            }
        }
    }, [isDefaultStrategyEdit, featureId, loading]);

    const groupId = parseParameterString(parameters.groupId);

    if (loading) {
        return <Loader />;
    }

    return (
        <StyledBox>
            <ConditionalRolloutSlider
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
                        onChange={(e) =>
                            updateParameter('stickiness', e.target.value)
                        }
                    />
                </StyledInnerBox1>
                <StyledInnerBox2>
                    <Input
                        label='groupId'
                        sx={{ width: '100%' }}
                        id='groupId-input'
                        value={groupId}
                        disabled={!editable}
                        onChange={(e) =>
                            updateParameter(
                                'groupId',
                                parseParameterString(e.target.value),
                            )
                        }
                        data-testid={FLEXIBLE_STRATEGY_GROUP_ID}
                        error={Boolean(errors?.getFormError('groupId'))}
                        helperText={errors?.getFormError('groupId')}
                    />
                </StyledInnerBox2>
            </StyledOuterBox>
        </StyledBox>
    );
};

export default FlexibleStrategy;
