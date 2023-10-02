import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    styled,
} from '@mui/material';
import {
    Operator,
    stringOperators,
    semVerOperators,
    dateOperators,
    numOperators,
    inOperators,
} from 'constants/operators';
import React, { useState } from 'react';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';

interface IConstraintOperatorSelectProps {
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
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
    shouldForwardProp: prop => prop !== 'separator',
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
        : {}
);

const StyledOptionContainer = styled('div')(({ theme }) => ({
    lineHeight: 1.2,
}));

export const ConstraintOperatorSelect = ({
    options,
    value,
    onChange,
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

    return (
        <StyledFormInput variant="outlined" size="small" fullWidth>
            <InputLabel htmlFor="operator-select">Operator</InputLabel>
            <Select
                id="operator-select"
                name="operator"
                label="Operator"
                value={value}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={onSelectChange}
                renderValue={renderValue}
            >
                {options.map(operator => (
                    <StyledMenuItem
                        key={operator}
                        value={operator}
                        separator={needSeparatorAbove(options, operator)}
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

    return operatorGroups.some(group => {
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
