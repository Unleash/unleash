import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { IConstraint } from 'interfaces/strategy';

import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import React from 'react';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo/ConstraintAccordionViewHeaderInfo';
import { ConstraintAccordionHeaderActions } from '../../ConstraintAccordionHeaderActions/ConstraintAccordionHeaderActions';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeader = ({
    constraint,
    onEdit,
    onDelete,
    singleValue,
    allowExpand,
    expanded,
}: IConstraintAccordionViewHeaderProps) => {
    const { classes: styles } = useStyles();

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                singleValue={singleValue}
                allowExpand={allowExpand}
                expanded={expanded}
            />
            <ConstraintAccordionHeaderActions
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
};
