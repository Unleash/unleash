import { styled, Tooltip, Typography, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PlaygroundSingleValue } from './PlaygroundSingleValue/PlaygroundSingleValue';
import { PLaygroundMultipleValues } from './PlaygroundMultipleValues/PLaygroundMultipleValues';
import React from 'react';
import { useStyles } from '../../ConstraintAccordion.styles';
import { CancelOutlined } from '@mui/icons-material';
import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { ConstraintViewHeaderOperator } from 'component/common/ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionViewHeader/ConstraintViewHeaderOperator/ConstraintViewHeaderOperator';

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

const StyledHeaderWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    borderRadius: theme.spacing(1),
}));

interface PlaygroundConstraintAccordionViewHeaderInfoProps {
    constraint: PlaygroundConstraintSchema;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    result?: boolean;
    maxLength?: number;
    playgroundInput?: PlaygroundRequestSchema;
}

export const ConstraintAccordionViewHeaderInfo = ({
    constraint,
    singleValue,
    allowExpand,
    expanded,
    result,
    playgroundInput,
    maxLength = 112,
}: PlaygroundConstraintAccordionViewHeaderInfoProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const constraintExistsInContext = Boolean(
        playgroundInput?.context[constraint.contextName]
    );

    return (
        <StyledHeaderWrapper>
            <div className={styles.headerMetaInfo}>
                <Tooltip title={constraint.contextName} arrow>
                    <StyledHeaderText>
                        {constraint.contextName}
                        <Typography
                            variant={'body1'}
                            color={
                                constraintExistsInContext
                                    ? theme.palette.neutral.dark
                                    : theme.palette.error.main
                            }
                        >
                            {playgroundInput?.context[constraint.contextName] ||
                                'no value'}
                        </Typography>
                    </StyledHeaderText>
                </Tooltip>
                <ConstraintViewHeaderOperator constraint={constraint} />
                <ConditionallyRender
                    condition={singleValue}
                    show={
                        <PlaygroundSingleValue
                            constraint={constraint}
                            allowExpand={allowExpand}
                        />
                    }
                    elseShow={
                        <PLaygroundMultipleValues
                            constraint={constraint}
                            expanded={expanded}
                            allowExpand={allowExpand}
                            maxLength={maxLength}
                        />
                    }
                />
            </div>
            <ConditionallyRender
                condition={result !== undefined && !Boolean(result)}
                show={<CancelOutlined color="error" sx={{ mt: 1 }} />}
            />
        </StyledHeaderWrapper>
    );
};
