import React, { useEffect } from 'react';
import { Chip, styled, Typography } from '@mui/material';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { PlaygroundConstraintSchema } from 'hooks/api/actions/usePlayground/playground.model';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledSingleValueChip = styled(Chip)(({ theme }) => ({
    margin: 'auto 0',
    [theme.breakpoints.down(710)]: {
        margin: theme.spacing(1, 0),
    },
}));

interface PlaygroundConstraintAccordionViewHeaderSingleValueProps {
    constraint: PlaygroundConstraintSchema;
    allowExpand: (shouldExpand: boolean) => void;
}

export const PlaygroundConstraintAccordionViewHeaderSingleValue = ({
    constraint,
    allowExpand,
}: PlaygroundConstraintAccordionViewHeaderSingleValueProps) => {
    const { locationSettings } = useLocationSettings();
    const { classes: styles } = useStyles();

    useEffect(() => {
        allowExpand(false);
    }, [allowExpand]);

    return (
        <div className={styles.headerValuesContainerWrapper}>
            <ConditionallyRender
                condition={!Boolean(constraint.result)}
                show={
                    <Typography variant={'body1'} color={'error'}>
                        does not match any values{' '}
                    </Typography>
                }
            />
            <StyledSingleValueChip
                label={formatConstraintValue(constraint, locationSettings)}
            />
        </div>
    );
};
