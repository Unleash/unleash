import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    type SelectChangeEvent,
    styled,
} from '@mui/material';
import {
    type Operator,
    stringOperators,
    semVerOperators,
    dateOperators,
    numOperators,
    inOperators,
    type ContextFieldType,
    getOperatorsForContextFieldType,
} from 'constants/operators';
import { useState } from 'react';
import { formatOperatorDescription } from 'component/common/LegacyConstraintAccordion/ConstraintOperator/formatOperatorDescription';

interface IConstraintOperatorSelectProps {
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
    contextFieldType?: ContextFieldType;
}

const StyledValueContainer = styled('div')(({ theme }) => ({
    lineHeight: 1.1,
    marginTop: -2,
    marginBottom: -10,
}));

const StyledLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
}));

const StyledFormInput = styled(FormControl)(({ theme }) => ({
    [theme.breakpoints.between(1101, 1365)]: {
        width: '170px',
        marginRight: theme.spacing(0.5),
    },
}));

const StyledMenuItem = styled(MenuItem, {
    shouldForwardProp: (prop) => prop !== 'separator',
})<{ separator: boolean }>(({ theme, separator }) =>
    separator
        ? {
              position: 'relative',
              overflow: 'visible',
              marginTop: theme.spacing(2),
              '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: theme.spacing(-1),
                  left: 0,
                  right: 0,
                  borderTop: '1px solid',
                  borderTopColor: theme.palette.divider,
              },
          }
        : {},
);

const StyledOptionContainer = styled('div')(({ theme }) => ({
    lineHeight: 1.2,
}));

export const ConstraintOperatorSelect = ({
    options,
    value,
    onChange,
    contextFieldType,
}: IConstraintOperatorSelectProps) => {
    const [open, setOpen] = useState(false);

    const onSelectChange = (event: SelectChangeEvent) => {
        onChange(event.target.value as Operator);
    };

    const renderValue = () => {
        return (
            <StyledValueContainer>
                <StyledLabel>{value}</StyledLabel>
                <StyledDescription>
                    {formatOperatorDescription(value)}
                </StyledDescription>
            </StyledValueContainer>
        );
    };

    let displayedOptions = options;
    if (contextFieldType) {
        const allowedByType = getOperatorsForContextFieldType(contextFieldType);
        displayedOptions = options.filter((op) => allowedByType.includes(op));
    }

    // todo (addEditStrategy): add prop to configure the select element or style it. (currently, the chevron is different from the other select element we use). Maybe add a new component.
    return (
        <StyledFormInput variant='outlined' size='small' fullWidth>
            <InputLabel htmlFor='operator-select'>Operator</InputLabel>
            <Select
                id='operator-select'
                name='operator'
                label='Operator'
                value={value}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={onSelectChange}
                renderValue={renderValue}
            >
                {displayedOptions.map((operator) => (
                    <StyledMenuItem
                        key={operator}
                        value={operator}
                        separator={needSeparatorAbove(
                            displayedOptions,
                            operator,
                        )}
                    >
                        <StyledOptionContainer>
                            <StyledLabel>{operator}</StyledLabel>
                            <StyledDescription>
                                {formatOperatorDescription(operator)}
                            </StyledDescription>
                        </StyledOptionContainer>
                    </StyledMenuItem>
                ))}
            </Select>
        </StyledFormInput>
    );
};

const needSeparatorAbove = (options: Operator[], option: Operator): boolean => {
    if (option === options[0]) {
        return false;
    }

    return operatorGroups.some((group) => {
        return group[0] === option;
    });
};

const operatorGroups = [
    inOperators,
    stringOperators,
    numOperators,
    dateOperators,
    semVerOperators,
];
