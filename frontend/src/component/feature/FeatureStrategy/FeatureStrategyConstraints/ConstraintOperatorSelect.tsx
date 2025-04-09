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
    inOperators,
} from 'constants/operators';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { useId } from 'react';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';

interface IConstraintOperatorSelectProps {
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
}

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    height: 'auto',
    background: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightBold,
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

export const ConstraintOperatorSelect = ({
    options,
    value,
    onChange,
}: IConstraintOperatorSelectProps) => {
    const id = useId();
    const onSelectChange = (event: SelectChangeEvent<unknown>) => {
        onChange(event.target.value as Operator);
    };

    const renderValue = () => {
        return formatOperatorDescription(value);
    };

    return (
        <FormControl variant='outlined' size='small' hiddenLabel>
            <ScreenReaderOnly>
                <InputLabel htmlFor='operator-select'>Operator</InputLabel>
            </ScreenReaderOnly>
            <StyledSelect
                id={id}
                name='operator'
                value={value}
                onChange={onSelectChange}
                renderValue={renderValue}
                IconComponent={KeyboardArrowDownOutlined}
            >
                {options.map((operator) => (
                    <StyledMenuItem
                        key={operator}
                        value={operator}
                        separator={needSeparatorAbove(options, operator)}
                    >
                        {formatOperatorDescription(operator)}
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
];
