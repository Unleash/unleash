import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { oneOf } from '../../../../../../utils/oneOf';
import { stringOperators } from '../../../../../../constants/operators';
import { styled, Tooltip } from '@mui/material';
import { ReactComponent as CaseSensitive } from '../../../../../../assets/icons/24_Text format.svg';
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { StyledIconWrapper } from '../StyledIconWrapper/StyledIconWrapper';
import { IConstraint } from '../../../../../../interfaces/strategy';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { getTextWidth } from '../../../helpers';

const StyledValuesSpan = styled('span')(({ theme }) => ({
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.smallBody,
    [theme.breakpoints.down(710)]: {
        margin: theme.spacing(1, 0),
        textAlign: 'center',
    },
}));

interface ConstraintSingleValueProps {
    constraint: IConstraint;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeaderMultipleValues = ({
    constraint,
    expanded,
    allowExpand,
}: ConstraintSingleValueProps) => {
    const { classes: styles } = useStyles();

    const elementRef = useRef<HTMLElement>(null);

    const [width, setWidth] = useState(0);
    const [textWidth, setTextWidth] = useState(0);
    const [expandable, setExpandable] = useState(false);

    useEffect(() => {
        if (elementRef && elementRef.current != null) {
            setTextWidth(
                Math.round(getTextWidth(elementRef.current.innerText) / 2) // 2 lines
            );
            setWidth(elementRef.current.clientWidth);
        }
    }, []);

    useEffect(() => {
        if (textWidth && width) {
            setExpandable(textWidth > width);
        }
    }, [textWidth, width]);

    useEffect(() => {
        allowExpand(expandable);
    }, [expandable, allowExpand]);

    return (
        <div className={styles.headerValuesContainerWrapper}>
            <ConditionallyRender
                condition={
                    !Boolean(constraint.caseInsensitive) &&
                    oneOf(stringOperators, constraint.operator)
                }
                show={
                    <Tooltip title="Case sensitive is active" arrow>
                        <StyledIconWrapper margintop={'auto'}>
                            <CaseSensitive />{' '}
                        </StyledIconWrapper>
                    </Tooltip>
                }
            />
            <div className={styles.headerValuesContainer}>
                <StyledValuesSpan ref={elementRef}>
                    {constraint?.values?.map(value => value).join(', ')}
                </StyledValuesSpan>
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
                                ? `View all (
                                            ${constraint?.values?.length})`
                                : 'View less'}
                        </p>
                    }
                />
            </div>
        </div>
    );
};
