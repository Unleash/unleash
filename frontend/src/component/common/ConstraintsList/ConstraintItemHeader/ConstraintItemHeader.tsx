import { useMemo, type ComponentProps, type FC } from 'react';
import { StrategyEvaluationItem } from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import { styled, Tooltip } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ValuesList } from '../ValuesList/ValuesList';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';

const Inverted: FC = () => (
    <Tooltip title='NOT (operator is negated)' arrow>
        <StrategyEvaluationChip label='≠' />
    </Tooltip>
);

const Operator: FC<{ label: ConstraintSchema['operator'] }> = ({ label }) => (
    <Tooltip title={label} arrow>
        <StrategyEvaluationChip label={formatOperatorDescription(label)} />
    </Tooltip>
);

const CaseInsensitive: FC = () => (
    <Tooltip title='Case sensitive' arrow>
        <StrategyEvaluationChip label={<s>Aa</s>} />
    </Tooltip>
);

const StyledOperatorGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledConstraintName = styled('div')(({ theme }) => ({
    maxWidth: '150px',
    paddingRight: theme.spacing(0.5),
    overflow: 'hidden',
}));

export const ConstraintItemHeader: FC<
    ConstraintSchema & Pick<ComponentProps<typeof ValuesList>, 'onSetTruncated'>
> = ({ onSetTruncated, ...constraint }) => {
    const { caseInsensitive, contextName, inverted, operator, value, values } =
        constraint;
    const { context } = useUnleashContext();
    const { locationSettings } = useLocationSettings();
    const items = value
        ? [
              formatConstraintValue(constraint, locationSettings) || '',
              ...(values || []),
          ]
        : values || [];

    const tooltips = useMemo(
        () =>
            // FIXME: tooltips
            Object.fromEntries(
                values?.map((value) => [
                    value,
                    context.find(({ name }) => name === value)?.description,
                ]) || [],
            ),
        [context, values],
    );

    return (
        <StrategyEvaluationItem type='Constraint'>
            <StyledConstraintName>
                <Truncator lines={2} title={contextName} arrow>
                    {contextName}
                </Truncator>
            </StyledConstraintName>
            <StyledOperatorGroup>
                {inverted ? <Inverted /> : null}
                <Operator label={operator} />
                {caseInsensitive ? <CaseInsensitive /> : null}
            </StyledOperatorGroup>
            <ValuesList
                values={items}
                onSetTruncated={onSetTruncated}
                tooltips={tooltips}
            />
        </StrategyEvaluationItem>
    );
};
