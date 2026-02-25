import type { ComponentProps, FC, ReactNode } from 'react';
import { StrategyEvaluationItem } from '../StrategyEvaluationItem/StrategyEvaluationItem.tsx';
import type { ConstraintSchema } from 'openapi';
import { StrategyEvaluationChip } from '../StrategyEvaluationChip/StrategyEvaluationChip.tsx';
import { styled, Tooltip } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ValuesList } from '../ValuesList/ValuesList.tsx';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useConstraintTooltips } from './hooks/useConstraintTooltips.ts';
import { ReactComponent as CaseSensitiveIcon } from 'assets/icons/case-sensitive.svg';
import { isCaseSensitive } from './isCaseSensitive.ts';
import { formatOperatorDescription } from 'utils/formatOperatorDescription.ts';
import { FeatureSdkWarning } from 'component/common/FeatureSdkWarning/FeatureSdkWarning.tsx';

const Operator: FC<{
    label: ConstraintSchema['operator'];
    inverted?: boolean;
}> = ({ label, inverted }) => (
    <Tooltip title={inverted ? `Not ${label}` : label} arrow>
        <StrategyEvaluationChip
            label={formatOperatorDescription(label, inverted)}
            multiline
        />
    </Tooltip>
);

const StrategyEvalChipLessInlinePadding = styled(StrategyEvaluationChip)(
    ({ theme }) => ({
        alignSelf: 'stretch',
        height: 'auto',
        padding: 0,
        '> span': {
            paddingInline: theme.spacing(0),
        },
        svg: {
            path: {
                fill: 'currentColor',
            },
            '--size': theme.spacing(2.5),
            width: 'var(--size)',
            height: 'var(--size)',
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

const StyledConstraintContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(2),
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        placeItems: 'center',
    },
}));

const StyledOperatorGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledConstraintName = styled('div')(({ theme }) => ({
    maxWidth: '150px',
    paddingRight: theme.spacing(0.5),
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        maxWidth: 'unset',
    },
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
            <StyledConstraintContainer>
                <StyledConstraintName>
                    <Truncator title={contextName} arrow>
                        {contextName}
                    </Truncator>
                </StyledConstraintName>
                <StyledOperatorGroup>
                    <Operator label={operator} inverted={inverted} />
                    {operator === 'REGEX' && (
                        <FeatureSdkWarning featureName='regexOperator' />
                    )}
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
            </StyledConstraintContainer>
        </StrategyEvaluationItem>
    );
};
