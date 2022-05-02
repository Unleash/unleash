import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Chip, useMediaQuery, IconButton } from '@material-ui/core';
import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { Delete, Edit } from '@material-ui/icons';
import { IConstraint } from 'interfaces/strategy';

import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConstraintOperator } from 'component/common/ConstraintAccordion/ConstraintOperator/ConstraintOperator';

interface IConstraintAccordionViewHeaderProps {
    compact: boolean;
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    singleValue: boolean;
}

export const ConstraintAccordionViewHeader = ({
    compact,
    constraint,
    onEdit,
    onDelete,
    singleValue,
}: IConstraintAccordionViewHeaderProps) => {
    const styles = useStyles();
    const { locationSettings } = useLocationSettings();
    const smallScreen = useMediaQuery(`(max-width:${790}px)`);

    const minWidthHeader = compact || smallScreen ? '100px' : '175px';

    const onEditClick =
        onEdit &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onEdit();
        });

    const onDeleteClick =
        onDelete &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onDelete();
        });

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <div className={styles.headerMetaInfo}>
                <div style={{ minWidth: minWidthHeader }}>
                    <StringTruncator
                        text={constraint.contextName}
                        maxWidth="175px"
                        maxLength={25}
                    />
                </div>
                <div className={styles.headerConstraintContainer}>
                    <ConstraintOperator constraint={constraint} />
                </div>
                <div className={styles.headerViewValuesContainer}>
                    <ConditionallyRender
                        condition={singleValue}
                        show={
                            <Chip
                                label={formatConstraintValue(
                                    constraint,
                                    locationSettings
                                )}
                            />
                        }
                        elseShow={
                            <div className={styles.headerValuesContainer}>
                                <p className={styles.headerValues}>
                                    {constraint?.values?.length}{' '}
                                    {constraint?.values?.length === 1
                                        ? 'value'
                                        : 'values'}
                                </p>
                                <p className={styles.headerValuesExpand}>
                                    Expand to view
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>
            <div className={styles.headerActions}>
                <ConditionallyRender
                    condition={Boolean(onEditClick)}
                    show={() => (
                        <IconButton type="button" onClick={onEditClick}>
                            <Edit titleAccess="Edit constraint" />
                        </IconButton>
                    )}
                />
                <ConditionallyRender
                    condition={Boolean(onDeleteClick)}
                    show={() => (
                        <IconButton type="button" onClick={onDeleteClick}>
                            <Delete titleAccess="Delete constraint" />
                        </IconButton>
                    )}
                />
            </div>
        </div>
    );
};
