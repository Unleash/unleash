import type { ComponentProps, FC, ReactNode } from 'react';
import { StrategyEvaluationItem } from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { ConstraintSchema } from 'openapi';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import { styled, Tooltip } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ValuesList } from '../ValuesList/ValuesList';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useConstraintTooltips } from './hooks/useConstraintTooltips';
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
                aria-label='The match is case sensitive'
                label={
                    <CaseSensitiveIcon
                        style={{ verticalAlign: 'middle' }}
                        fill='currentColor'
                        aria-hidden={true}
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

const StyledConstraintName = styled('div')(({ theme }) => ({
    maxWidth: '150px',
    paddingRight: theme.spacing(0.5),
    overflow: 'hidden',
}));

type ConstraintItemHeaderProps = ConstraintSchema & {
    viewMore?: ReactNode;
} & Pick<ComponentProps<typeof ValuesList>, 'onSetTruncated'>;

export const ConstraintItemHeader: FC<ConstraintItemHeaderProps> = ({
    onSetTruncated,
    viewMore,
    ...constraint
}) => {
    const { caseInsensitive, contextName, inverted, operator, value, values } =
        constraint;
    const { locationSettings } = useLocationSettings();
    const items = value
        ? [
              formatConstraintValue(constraint, locationSettings) || '',
              ...(values || []),
          ]
        : values || [];

    const tooltips = useConstraintTooltips(contextName, values || []);

    return (
        <StrategyEvaluationItem type='Constraint'>
            <StyledConstraintName>
                <Truncator lines={2} title={contextName} arrow>
                    {contextName}
                </Truncator>
            </StyledConstraintName>
            <StyledOperatorGroup>
                <Operator label={operator} inverted={inverted} />
                {isCaseSensitive(operator, caseInsensitive) ? (
                    <CaseSensitive />
                ) : null}
            </StyledOperatorGroup>
            <div>
                <ValuesList
                    values={items}
                    onSetTruncated={onSetTruncated}
                    tooltips={tooltips}
                />
                {viewMore}
            </div>
        </StrategyEvaluationItem>
    );
};
