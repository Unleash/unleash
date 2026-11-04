import type { CSSProperties } from 'react';
import { styled, Typography } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { constraintTextParts } from 'utils/formatConstraintText';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { constraintId } from 'constants/constraintId';

const FormattedRuleValues = ({ values }: { values: string[] }) => {
    const namedValues = values.slice(0, 3).join(', ');

    const remainingValues = values.length - 3;

    const remainingText =
        remainingValues > 0 ? (
            <Typography component='span' color='textSecondary'>
                +{remainingValues} more
            </Typography>
        ) : null;

    return (
        <>
            <strong>{namedValues}</strong> {remainingText}
        </>
    );
};

const SegmentRow = ({ segments }: { segments?: string[] }) => {
    if (!segments || segments.length === 0) return null;

    return (
        <li>
            the user is part of <FormattedRuleValues values={segments} />
        </li>
    );
};

export const RuleList = styled(
    ({
        segments,
        constraints,
        ...props
    }: {
        segments?: string[];
        constraints?: IConstraint[];
        className?: string;
    }) => {
        const { locationSettings } = useLocationSettings();
        const ruleCount =
            (segments?.length ? 1 : 0) + (constraints?.length ?? 0);
        return (
            <ol
                style={
                    {
                        '--marker-width': `${String(ruleCount).length}ch`,
                    } as CSSProperties
                }
                {...props}
            >
                <SegmentRow segments={segments} />
                {constraints?.map((constraint, index) => {
                    const { contextName, operatorText, values } =
                        constraintTextParts(constraint, locationSettings);

                    return (
                        <li key={constraint[constraintId] || index}>
                            <strong>{contextName}</strong> {operatorText}{' '}
                            <FormattedRuleValues values={values} />
                        </li>
                    );
                })}
            </ol>
        );
    },
)(({ theme }) => ({
    '@counter-style rule-number': {
        system: 'extends decimal',
        suffix: '""',
    },
    '--separator': `1px solid ${theme.palette.divider}`,
    listStyle: 'rule-number',
    paddingInlineStart: 'var(--marker-width)',
    borderBlockEnd: `var(--separator)`,
    '& > li': {
        position: 'relative',
        paddingInlineStart: theme.spacing(3),
        paddingBlock: theme.spacing(1),
    },
    '& > li::before': {
        content: '""',
        position: 'absolute',
        insetBlockStart: 0,
        insetInline: 'calc(-1 * var(--marker-width)) 0',
        borderBlockStart: `var(--separator)`,
    },
    '& > li::marker': {
        fontVariantNumeric: 'tabular-nums',
        color: theme.palette.primary.onContainer,
    },
}));
