import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { IConstraint } from '../../../../../../interfaces/strategy';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { PlaygroundFeatureStrategyConstraintResult } from '../../../../../../hooks/api/actions/usePlayground/playground.model';

const StyledValuesSpan = styled('span')(({ theme }) => ({
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.smallBody,
    margin: 'auto 0',
    [theme.breakpoints.down(710)]: {
        margin: theme.spacing(1, 0),
        textAlign: 'center',
    },
}));

interface ConstraintSingleValueProps {
    constraint: IConstraint | PlaygroundFeatureStrategyConstraintResult;
    expanded: boolean;
    maxLength: number;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeaderMultipleValues = ({
    constraint,
    expanded,
    allowExpand,
    maxLength,
}: ConstraintSingleValueProps) => {
    const { classes: styles } = useStyles();

    const [expandable, setExpandable] = useState(false);

    const text = useMemo(() => {
        return constraint?.values?.map(value => value).join(', ');
    }, [constraint]);

    useEffect(() => {
        if (text) {
            allowExpand((text?.length ?? 0) > maxLength);
            setExpandable((text?.length ?? 0) > maxLength);
        }
    }, [text, maxLength, allowExpand, setExpandable]);

    return (
        <div className={styles.headerValuesContainerWrapper}>
            <div className={styles.headerValuesContainer}>
                <ConditionallyRender
                    condition={
                        'result' in constraint && !Boolean(constraint.result)
                    }
                    show={
                        <Typography
                            variant={'body2'}
                            color={'error'}
                            noWrap={true}
                            sx={{ mr: 1 }}
                        >
                            does not match any values{' '}
                        </Typography>
                    }
                />
                <StyledValuesSpan>{text}</StyledValuesSpan>
                <ConditionallyRender
                    condition={expandable}
                    show={
                        <p
                            className={classnames(
                                styles.headerValuesExpand,
                                'valuesExpandLabel'
                            )}
                        >
                            {!expanded
                                ? `View all (${constraint?.values?.length})`
                                : 'View less'}
                        </p>
                    }
                />
            </div>
        </div>
    );
};
