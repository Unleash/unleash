import { styled, Tooltip } from '@mui/material';
import { ConstraintViewHeaderOperator } from './ConstraintViewHeaderOperator';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ConstraintAccordionViewHeaderSingleValue } from './ConstraintAccordionViewHeaderSingleValue';
import { ConstraintAccordionViewHeaderMultipleValues } from './ConstraintAccordionViewHeaderMultipleValues';
import type { IConstraint } from 'interfaces/strategy';

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

const StyledHeaderMetaInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
}));

interface ConstraintAccordionViewHeaderMetaInfoProps {
    constraint: IConstraint;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    disabled?: boolean;
    maxLength?: number;
}

export const ConstraintAccordionViewHeaderInfo = ({
    constraint,
    singleValue,
    allowExpand,
    expanded,
    disabled = false,
    maxLength = 112, //The max number of characters in the values text for NOT allowing expansion
}: ConstraintAccordionViewHeaderMetaInfoProps) => {
    return (
        <StyledHeaderWrapper>
            <StyledHeaderMetaInfo>
                <Tooltip title={constraint.contextName} arrow>
                    <StyledHeaderText
                        sx={(theme) => ({
                            color: disabled
                                ? theme.palette.text.secondary
                                : 'inherit',
                        })}
                    >
                        {constraint.contextName}
                    </StyledHeaderText>
                </Tooltip>
                <ConstraintViewHeaderOperator
                    constraint={constraint}
                    disabled={disabled}
                />
                <ConditionallyRender
                    condition={singleValue}
                    show={
                        <ConstraintAccordionViewHeaderSingleValue
                            constraint={constraint}
                            allowExpand={allowExpand}
                            disabled={disabled}
                        />
                    }
                    elseShow={
                        <ConstraintAccordionViewHeaderMultipleValues
                            constraint={constraint}
                            expanded={expanded}
                            allowExpand={allowExpand}
                            maxLength={maxLength}
                            disabled={disabled}
                        />
                    }
                />
            </StyledHeaderMetaInfo>
        </StyledHeaderWrapper>
    );
};
