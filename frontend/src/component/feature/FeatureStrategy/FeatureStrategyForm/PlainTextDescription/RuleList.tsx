import { type CSSProperties, useId, useState } from 'react';
import { Button, styled, Typography } from '@mui/material';
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

const SegmentRow = ({ segments }: { segments: string[] }) => (
    <li>
        the user is part of <FormattedRuleValues values={segments} />
    </li>
);

const MAX_VISIBLE_RULES = 6;

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
        const [showAll, setShowAll] = useState(false);
        const listId = useId();

        const rules = [
            ...(segments?.length
                ? [<SegmentRow key='segments' segments={segments} />]
                : []),
            ...(constraints ?? []).map((constraint, index) => {
                const { contextName, operatorText, values } =
                    constraintTextParts(constraint, locationSettings);

                return (
                    <li key={constraint[constraintId] || index}>
                        <strong>{contextName}</strong> {operatorText}{' '}
                        <FormattedRuleValues values={values} />
                    </li>
                );
            }),
        ];

        return (
            <>
                <ol
                    id={listId}
                    style={
                        {
                            '--marker-width': `${String(rules.length).length}ch`,
                        } as CSSProperties
                    }
                    {...props}
                >
                    {showAll ? rules : rules.slice(0, MAX_VISIBLE_RULES)}
                </ol>
                {rules.length > MAX_VISIBLE_RULES ? (
                    <Button
                        variant='text'
                        aria-controls={listId}
                        aria-expanded={showAll}
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll
                            ? 'Show less'
                            : `Show all ${rules.length} rules`}
                    </Button>
                ) : null}
            </>
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
