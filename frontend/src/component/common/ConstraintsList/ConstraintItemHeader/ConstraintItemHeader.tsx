import type { FC } from 'react';
import {
    StrategyEvaluationItem,
    type StrategyEvaluationItemProps,
} from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import { styled, Tooltip } from '@mui/material';

const Operator: FC<{
    label: ConstraintSchema['operator'];
    inverted?: boolean;
}> = ({ label, inverted }) => (
    <Tooltip title={label} arrow>
        <StrategyEvaluationChip
            label={formatOperatorDescription(label, inverted)}
        />
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

export const ConstraintItemHeader: FC<
    ConstraintSchema & Pick<StrategyEvaluationItemProps, 'onSetTruncated'>
> = ({
    caseInsensitive,
    contextName,
    inverted,
    operator,
    value,
    values,
    onSetTruncated,
}) => {
    const items = value ? [value, ...(values || [])] : values || [];

    return (
        <StrategyEvaluationItem
            type='Constraint'
            values={items}
            onSetTruncated={onSetTruncated}
        >
            {contextName}
            <StyledOperatorGroup>
                <Operator label={operator} inverted={inverted} />
                {caseInsensitive ? <CaseInsensitive /> : null}
            </StyledOperatorGroup>
        </StrategyEvaluationItem>
    );
};
