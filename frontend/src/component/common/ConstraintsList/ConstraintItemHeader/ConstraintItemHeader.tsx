import type { FC } from 'react';
import {
    StrategyEvaluationItem,
    type StrategyEvaluationItemProps,
} from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import { styled, Tooltip } from '@mui/material';
import { ReactComponent as CaseSensitiveIcon } from 'assets/icons/case-sensitive.svg';
import { isCaseSensitive } from './isCaseSensitive';

const Operator: FC<{
    label: ConstraintSchema['operator'];
    inverted?: boolean;
}> = ({ label, inverted }) => (
    <Tooltip title={inverted ? `Not ${label}` : label} arrow>
        <StrategyEvaluationChip
            label={formatOperatorDescription(label, inverted)}
        />
    </Tooltip>
);

const StrategyEvalChipLessInlinePadding = styled(StrategyEvaluationChip)(
    ({ theme }) => ({
        '> span': {
            paddingInline: theme.spacing(0.5),
        },
    }),
);

const CaseSensitive: FC = () => {
    return (
        <Tooltip title='The match is case sensitive' arrow>
            <StrategyEvalChipLessInlinePadding
                aria-hidden
                label={
                    <CaseSensitiveIcon
                        style={{ verticalAlign: 'middle' }}
                        fill='currentColor'
                    />
                }
            />
        </Tooltip>
    );
};

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
                {isCaseSensitive(operator, caseInsensitive) ? (
                    <CaseSensitive />
                ) : null}
            </StyledOperatorGroup>
        </StrategyEvaluationItem>
    );
};
