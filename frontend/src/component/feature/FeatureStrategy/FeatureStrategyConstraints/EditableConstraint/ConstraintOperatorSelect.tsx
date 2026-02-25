import {
    MenuItem,
    InputLabel,
    type SelectChangeEvent,
    styled,
    Select,
    FormControl,
} from '@mui/material';
import {
    type Operator,
    stringOperators,
    semVerOperators,
    dateOperators,
    numOperators,
    regexOperators,
    inOperators,
    isRegexOperator,
} from 'constants/operators';
import { useId } from 'react';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { formatOperatorDescription } from 'utils/formatOperatorDescription';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureSdkWarning } from 'component/common/FeatureSdkWarning/FeatureSdkWarning';

interface IConstraintOperatorSelectProps {
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
    inverted?: boolean;
}

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    background: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightBold,
    fieldset: {
        border: 'none',
    },
    transition: 'all 0.03s ease',
    '&:is(:hover, :focus-within)': {
        outline: `1px solid ${theme.palette.primary.main}`,
    },
    '&::before,&::after': {
        border: 'none',
    },
    '.MuiInput-input': {
        paddingBlock: theme.spacing(0.25),
    },
    ':focus-within .MuiSelect-select': {
        background: 'none',
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

const StyledValue = styled('span')(({ theme }) => ({
    paddingInline: theme.spacing(1),
}));

export const ConstraintOperatorSelect = ({
    options,
    value,
    onChange,
    inverted,
}: IConstraintOperatorSelectProps) => {
    const selectId = useId();
    const labelId = useId();
    const onSelectChange = (event: SelectChangeEvent<unknown>) => {
        onChange(event.target.value as Operator);
    };

    const renderValue = () => {
        return (
            <StyledValue>
                {formatOperatorDescription(value, inverted)}
                {value === 'REGEX' && (
                    <FeatureSdkWarning featureName='regexOperator' />
                )}
            </StyledValue>
        );
    };

    const isRegexOperatorEnabled = useUiFlag('regexConstraintOperator');

    const operators = isRegexOperatorEnabled
        ? options
        : options.filter((operator) => !isRegexOperator(operator));

    return (
        <FormControl variant='standard' size='small' hiddenLabel>
            <ScreenReaderOnly>
                <InputLabel id={labelId} htmlFor={selectId}>
                    Operator
                </InputLabel>
            </ScreenReaderOnly>
            <StyledSelect
                id={selectId}
                labelId={labelId}
                name='operator'
                disableUnderline
                value={value}
                onChange={onSelectChange}
                renderValue={renderValue}
                IconComponent={KeyboardArrowDownOutlined}
            >
                {operators.map((operator) => (
                    <StyledMenuItem
                        key={operator}
                        value={operator}
                        separator={needSeparatorAbove(operators, operator)}
                    >
                        {formatOperatorDescription(operator, inverted)}
                        {operator === 'REGEX' && (
                            <FeatureSdkWarning featureName='regexOperator' />
                        )}
                    </StyledMenuItem>
                ))}
            </StyledSelect>
        </FormControl>
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
    regexOperators,
];
