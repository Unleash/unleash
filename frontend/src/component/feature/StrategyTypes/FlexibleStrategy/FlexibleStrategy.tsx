import { Box, styled } from '@mui/material';
import type { IFeatureStrategyParameters } from 'interfaces/strategy';
import ConditionalRolloutSlider from '../RolloutSlider/ConditionalRolloutSlider.tsx';
import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
import { FormGroup } from 'component/common/FormGroup/FormGroup';
import {
    FLEXIBLE_STRATEGY_GROUP_ID,
    FLEXIBLE_STRATEGY_STICKINESS_ID,
} from 'utils/testIds';
import {
    parseParameterNumber,
    parseParameterString,
} from 'utils/parseParameter';
import { StickinessSelect } from './StickinessSelect/StickinessSelect.tsx';
import type { IFormErrors } from 'hooks/useFormErrors';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

interface IFlexibleStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    errors?: IFormErrors;
    groupIdTooltip?: React.ReactNode;
}

// Stickiness and groupId sit side by side under the rollout slider.
const StyledOuterBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    gap: theme.spacing(2),
    // Align the controls' baselines; spacing is owned by the row, so drop the
    // FormFields' own bottom margins and StickinessSelect's legacy one.
    alignItems: 'flex-end',
    '&& > *': {
        flex: 1,
        marginBottom: 0,
    },
    '&& .MuiFormControl-root': {
        marginBottom: 0,
    },
}));

const StyledGroupIdField = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    gap: theme.spacing(1),
    // The input fills the column; the help icon keeps its size.
    '&& > *': {
        marginBottom: 0,
    },
    '&& > *:first-of-type': {
        flex: 1,
    },
}));

export const FlexibleStrategy = ({
    updateParameter,
    parameters,
    errors,
    groupIdTooltip,
}: IFlexibleStrategyProps) => {
    const updateRollout = (_e: Event, value: number | number[]) => {
        updateParameter('rollout', value.toString());
    };

    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;

    const stickiness = parseParameterString(parameters.stickiness);
    const groupId = parseParameterString(parameters.groupId);

    return (
        <FormGroup>
            <ConditionalRolloutSlider
                name='Rollout'
                value={rollout}
                onChange={updateRollout}
            />
            <StyledOuterBox>
                <FormField label='Stickiness'>
                    <StickinessSelect
                        label=''
                        value={stickiness}
                        dataTestId={FLEXIBLE_STRATEGY_STICKINESS_ID}
                        onChange={(e) =>
                            updateParameter('stickiness', e.target.value)
                        }
                    />
                </FormField>
                <StyledGroupIdField>
                    <FormField label='groupId'>
                        <Input
                            label=''
                            sx={{ width: '100%' }}
                            value={groupId}
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
                    </FormField>
                    {groupIdTooltip ? (
                        <HelpIcon htmlTooltip tooltip={groupIdTooltip} />
                    ) : null}
                </StyledGroupIdField>
            </StyledOuterBox>
        </FormGroup>
    );
};
