import type { FC } from 'react';
import { StrategyExecutionItem } from '../StrategyExecutionItem/StrategyExecutionItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyChip } from '../StrategyChip/StrategyChip';
import { Chip, type ChipProps, styled, Tooltip } from '@mui/material';

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

const StyledGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledValue = styled(({ ...props }: ChipProps) => (
    <Chip size='small' {...props} />
))(({ theme }) => ({
    padding: theme.spacing(0.5),
    background: theme.palette.background.elevation1,
}));

export const ConstraintItem: FC<ConstraintSchema> = ({
    caseInsensitive,
    contextName,
    inverted,
    operator,
    value,
    values,
}) => (
    <StrategyExecutionItem type='Constraint'>
        {contextName}
        <StyledGroup>
            {inverted ? <Inverted /> : null}
            <Operator label={operator} />
            {caseInsensitive ? <CaseInsensitive /> : null}
        </StyledGroup>
        <StyledGroup>
            {value ? <StyledValue label={value} /> : null}
            {values?.map((item) => (
                <StyledValue key={item} label={item} />
            ))}
        </StyledGroup>
    </StrategyExecutionItem>
);
