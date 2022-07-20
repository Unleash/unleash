import { Chip, IconButton, Tooltip, styled } from '@mui/material';
import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { Delete, Edit } from '@mui/icons-material';
import { IConstraint } from 'interfaces/strategy';

import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import React, { useEffect, useRef, useState } from 'react';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConstraintOperator } from 'component/common/ConstraintAccordion/ConstraintOperator/ConstraintOperator';
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import { getTextWidth } from '../../utils';

const StyledHeaderText = styled('span')(({ theme }) => ({
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    maxWidth: '100px',
    minWidth: '100px',
    marginRight: '10px',
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.smallBody,
    [theme.breakpoints.down(710)]: {
        textAlign: 'center',
        padding: theme.spacing(1, 0),
        marginRight: 'inherit',
        maxWidth: 'inherit',
    },
}));

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

const StyledSingleValueChip = styled(Chip)(({ theme }) => ({
    [theme.breakpoints.down(710)]: {
        margin: theme.spacing(1, 0),
    },
}));

interface IConstraintAccordionViewHeaderProps {
    compact: boolean;
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    singleValue: boolean;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeader = ({
    compact,
    constraint,
    onEdit,
    onDelete,
    singleValue,
    allowExpand,
}: IConstraintAccordionViewHeaderProps) => {
    const { classes: styles } = useStyles();
    const { locationSettings } = useLocationSettings();
    const [width, setWidth] = useState(0);
    const [textWidth, setTextWidth] = useState(0);
    const [expandable, setExpandable] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

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
            allowExpand(textWidth > width);
        }
    }, [textWidth, width, allowExpand]);

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <div className={styles.headerMetaInfo}>
                <Tooltip title={constraint.contextName} arrow>
                    <StyledHeaderText>
                        {constraint.contextName}
                    </StyledHeaderText>
                </Tooltip>
                <div className={styles.headerConstraintContainer}>
                    <ConstraintOperator constraint={constraint} />
                </div>
                <ConditionallyRender
                    condition={singleValue}
                    show={
                        <StyledSingleValueChip
                            label={formatConstraintValue(
                                constraint,
                                locationSettings
                            )}
                        />
                    }
                    elseShow={
                        <div className={styles.headerValuesContainer}>
                            <StyledValuesSpan ref={elementRef}>
                                {constraint?.values
                                    ?.map(value => value)
                                    .join(', ')}
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
                                        Expand to view all (
                                        {constraint?.values?.length})
                                    </p>
                                }
                            />
                        </div>
                    }
                />
            </div>
            <div className={styles.headerActions}>
                <ConditionallyRender
                    condition={Boolean(onEditClick)}
                    show={() => (
                        <Tooltip title="Edit constraint" arrow>
                            <IconButton type="button" onClick={onEditClick}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                    )}
                />
                <ConditionallyRender
                    condition={Boolean(onDeleteClick)}
                    show={() => (
                        <Tooltip title="Delete constraint" arrow>
                            <IconButton type="button" onClick={onDeleteClick}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    )}
                />
            </div>
        </div>
    );
};
