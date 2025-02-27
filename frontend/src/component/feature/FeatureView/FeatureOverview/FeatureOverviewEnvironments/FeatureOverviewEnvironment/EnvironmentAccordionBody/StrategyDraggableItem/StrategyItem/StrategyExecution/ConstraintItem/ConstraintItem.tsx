import type { FC } from 'react';
import { StrategyExecutionItem } from '../StrategyExecutionItem/StrategyExecutionItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyChip } from '../StrategyChip/StrategyChip';
import { styled, Tooltip } from '@mui/material';

const Inverted: FC = () => (
    <Tooltip title='NOT (operator is negated)' arrow>
        <StrategyChip label='≠' />
    </Tooltip>
);

const Operator: FC<{ label: ConstraintSchema['operator'] }> = ({ label }) => (
    <Tooltip title={label} arrow>
        <StrategyChip label={formatOperatorDescription(label)} />
    </Tooltip>
);

const CaseInsensitive: FC = () => (
    <Tooltip title='Case sensitive' arrow>
        <StrategyChip label={<del>Aa</del>} />
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
        <StrategyExecutionItem type='Constraint' values={items}>
            {contextName}
            <StyledOperatorGroup>
                {inverted ? <Inverted /> : null}
                <Operator label={operator} />
                {caseInsensitive ? <CaseInsensitive /> : null}
            </StyledOperatorGroup>
        </StrategyExecutionItem>
    );
};
