import type { FC } from 'react';
import { StrategyEvaluationItem } from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import { styled, Tooltip } from '@mui/material';

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

export const ConstraintItem: FC<ConstraintSchema> = ({
    caseInsensitive,
    contextName,
    inverted,
    operator,
    value,
    values,
}) => {
    const items = value ? [value, ...(values || [])] : values || [];

    return (
        <StrategyEvaluationItem type='Constraint' values={items}>
            {contextName}
            <StyledOperatorGroup>
                {inverted ? <Inverted /> : null}
                <Operator label={operator} />
                {caseInsensitive ? <CaseInsensitive /> : null}
            </StyledOperatorGroup>
        </StrategyEvaluationItem>
    );
};
