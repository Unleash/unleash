import { styled, Tooltip } from '@mui/material';
import { ConstraintViewHeaderOperator } from '../ConstraintViewHeaderOperator/ConstraintViewHeaderOperator';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { ContraintAccordionViewHeaderSingleValue } from '../ContraintAccordionViewHeaderSingleValue/ContraintAccordionViewHeaderSingleValue';
import { ConstraintAccordionViewHeaderMultipleValues } from '../ContraintAccordionViewHeaderMultipleValues/ConstraintAccordionViewHeaderMultipleValues';
import React from 'react';
import { IConstraint } from '../../../../../../interfaces/strategy';
import { useStyles } from '../../../ConstraintAccordion.styles';

const StyledHeaderText = styled('span')(({ theme }) => ({
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    maxWidth: '100px',
    minWidth: '100px',
    marginRight: '10px',
    marginTop: 'auto',
    marginBottom: 'auto',
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.smallBody,
    [theme.breakpoints.down(710)]: {
        textAlign: 'center',
        padding: theme.spacing(1, 0),
        marginRight: 'inherit',
        maxWidth: 'inherit',
    },
}));

interface ConstraintAccordionViewHeaderMetaInfoProps {
    constraint: IConstraint;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeaderInfo = ({
    constraint,
    singleValue,
    allowExpand,
    expanded,
}: ConstraintAccordionViewHeaderMetaInfoProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.headerMetaInfo}>
            <Tooltip title={constraint.contextName} arrow>
                <StyledHeaderText>{constraint.contextName}</StyledHeaderText>
            </Tooltip>
            <ConstraintViewHeaderOperator constraint={constraint} />
            <ConditionallyRender
                condition={singleValue}
                show={
                    <ContraintAccordionViewHeaderSingleValue
                        constraint={constraint}
                    />
                }
                elseShow={
                    <ConstraintAccordionViewHeaderMultipleValues
                        constraint={constraint}
                        expanded={expanded}
                        allowExpand={allowExpand}
                    />
                }
            />
        </div>
    );
};
