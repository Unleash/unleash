import { Box, styled } from '@mui/material';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import ConditionalRolloutSlider from '../../../../feature/StrategyTypes/RolloutSlider/ConditionalRolloutSlider.tsx';
import type { IFormErrors } from 'hooks/useFormErrors';
import type { IFeatureStrategyParameters } from 'interfaces/strategy';
import { useMemo } from 'react';
import {
    parseParameterNumber,
    parseParameterString,
} from 'utils/parseParameter';
import Input from 'component/common/Input/Input';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

interface IMilestoneStrategyTypeFlexibleProps {
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
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '50%',
    marginLeft: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
    '& > div': {
        flex: 1,
    },
}));

const DEFAULT_STICKINESS = 'default';

export const MilestoneStrategyTypeFlexible = ({
    parameters,
    updateParameter,
    editable,
    errors,
}: IMilestoneStrategyTypeFlexibleProps) => {
    const updateRollout = (_e: Event, value: number | number[]) => {
        updateParameter('rollout', value.toString());
    };

    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;

    const stickiness = useMemo(() => {
        if (!parameters.stickiness) {
            updateParameter('stickiness', DEFAULT_STICKINESS);
        }

        return parseParameterString(parameters.stickiness);
    }, [parameters.stickiness]);

    const groupId = parseParameterString(parameters.groupId);

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
                        error={Boolean(errors?.getFormError('groupId'))}
                        helperText={errors?.getFormError('groupId')}
                    />
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <>
                                Supports <strong>{'{{featureName}}'}</strong> as
                                a template variable. If not set, defaults to the
                                feature flag name.
                            </>
                        }
                    />
                </StyledInnerBox2>
            </StyledOuterBox>
        </StyledBox>
    );
};
