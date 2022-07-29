import { styled, Tooltip, Typography, useTheme } from '@mui/material';
import { ConstraintViewHeaderOperator } from '../ConstraintViewHeaderOperator/ConstraintViewHeaderOperator';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { ConstraintAccordionViewHeaderSingleValue } from '../ContraintAccordionViewHeaderSingleValue/ConstraintAccordionViewHeaderSingleValue';
import { ConstraintAccordionViewHeaderMultipleValues } from '../ContraintAccordionViewHeaderMultipleValues/ConstraintAccordionViewHeaderMultipleValues';
import React from 'react';
import { IConstraint } from '../../../../../../interfaces/strategy';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { CancelOutlined } from '@mui/icons-material';
import { SdkContextSchema } from '../../../../../../hooks/api/actions/usePlayground/playground.model';

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
    borderRadius: '8px',
}));

interface ConstraintAccordionViewHeaderMetaInfoProps {
    constraint: IConstraint;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    result?: boolean;
    maxLength?: number;
    playgroundContext?: SdkContextSchema;
}

export const ConstraintAccordionViewHeaderInfo = ({
    constraint,
    singleValue,
    allowExpand,
    expanded,
    result,
    maxLength = 112,
    playgroundContext,
}: ConstraintAccordionViewHeaderMetaInfoProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    return (
        <StyledHeaderWrapper>
            <div className={styles.headerMetaInfo}>
                <Tooltip title={constraint.contextName} arrow>
                    <StyledHeaderText>
                        {constraint.contextName}
                        <ConditionallyRender
                            condition={
                                result !== undefined &&
                                Boolean(playgroundContext)
                            }
                            show={
                                <Typography
                                    variant={'body1'}
                                    color={
                                        Boolean(
                                            playgroundContext![
                                                constraint.contextName
                                            ]
                                        )
                                            ? theme.palette.neutral
                                                  .dark
                                            : theme.palette.error.main
                                    }
                                >
                                    {playgroundContext![
                                        constraint.contextName
                                    ] || 'no value'}
                                </Typography>
                            }
                        />
                    </StyledHeaderText>
                </Tooltip>
                <ConstraintViewHeaderOperator constraint={constraint} />
                <ConditionallyRender
                    condition={singleValue}
                    show={
                        <ConstraintAccordionViewHeaderSingleValue
                            constraint={constraint}
                            allowExpand={allowExpand}
                        />
                    }
                    elseShow={
                        <ConstraintAccordionViewHeaderMultipleValues
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
