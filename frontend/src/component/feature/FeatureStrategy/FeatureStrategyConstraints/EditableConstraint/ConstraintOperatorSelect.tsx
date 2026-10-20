import {
    Button,
    ListSubheader,
    MenuItem,
    MenuList,
    Popover,
    styled,
    ToggleButton,
    toggleButtonClasses,
    ToggleButtonGroup,
} from '@mui/material';
import {
    type Operator,
    stringOperators,
    semVerOperators,
    dateOperators,
    numOperators,
    regexOperators,
    cidrOperators,
    inOperators,
    isRegexOperator,
    isCidrOperator,
    SEMVER_GTE,
    SEMVER_LTE,
} from 'constants/operators';
import { type ElementType, useRef, useState } from 'react';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import Check from '@mui/icons-material/Check';
import {
    formatOperatorDescription,
    operatorExplanations,
} from 'utils/formatOperatorDescription';
import { useUiFlag } from 'hooks/useUiFlag';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { controlHeights } from 'themes/controls';

interface IConstraintOperatorSelectProps {
    contextName: string;
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
    inverted?: boolean;
    onToggleInverted: () => void;
    invertedDisabledText?: string;
}

const TriggerButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    whiteSpace: 'nowrap',
}));

const StyledHeader = styled(ListSubheader)<{ component?: ElementType }>(
    ({ theme }) => ({
        lineHeight: 'normal',
        fontSize: theme.fontSizes.smallerBody,
        fontWeight: theme.typography.fontWeightBold,
        textTransform: 'uppercase',
        color: theme.palette.text.disabled,
        padding: theme.spacing(1, 1.5, 0.5),
    }),
);

const StyledMenuList = styled(MenuList)(({ theme }) => ({
    maxHeight: theme.spacing(40),
    overflowY: 'auto',
    padding: 0,
}));

const StyledMatchToggle = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1.5, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledMatchButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadius}px`,
    overflow: 'hidden',
}));

const StyledMatchButton = styled(ToggleButton)(({ theme }) => ({
    flex: 1,
    textAlign: 'center',
    height: controlHeights.medium,
    padding: theme.spacing(0, 1.25),
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'none',
    border: 'none',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    [`&.${toggleButtonClasses.disabled}`]: {
        border: 'none',
    },
    '&:first-of-type': {
        borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    },
    '&:last-of-type': {
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
        boxShadow: `inset 1px 0 0 0 ${theme.palette.divider}`,
    },
    [`&.${toggleButtonClasses.selected}, &.${toggleButtonClasses.selected}:hover`]:
        {
            fontWeight: theme.typography.fontWeightBold,
            backgroundColor: theme.palette.primary.container,
            color: theme.palette.primary.main,
            boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
            zIndex: 1,
        },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
        zIndex: 1,
    },
}));

const StyledRow = styled(MenuItem, {
    shouldForwardProp: (prop) => prop !== 'separator',
})<{ separator: boolean }>(({ theme, separator }) => ({
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 'auto',
    gap: theme.spacing(0.25),
    padding: theme.spacing(1, 2),
    whiteSpace: 'normal',
    '&.Mui-selected, &.Mui-selected:hover, &.Mui-focusVisible': {
        backgroundColor: 'transparent',
    },
    '&[aria-selected="true"]': {
        backgroundColor: theme.palette.primary.container,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
        zIndex: 1,
    },
    ...(separator
        ? {
              '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid',
                  borderTopColor: theme.palette.divider,
              },
          }
        : {}),
}));

const StyledRowHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledRowIcon = styled('span')(({ theme }) => ({
    display: 'flex',
    width: theme.spacing(2.5),
    flexShrink: 0,
    color: theme.palette.primary.main,
}));

const StyledRowTitle = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledRowDescription = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(3.5),
}));

export const ConstraintOperatorSelect = ({
    contextName,
    options,
    value,
    onChange,
    inverted,
    onToggleInverted,
    invertedDisabledText,
}: IConstraintOperatorSelectProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const onClose = () => setAnchorEl(null);

    const isRegexOperatorEnabled = useUiFlag('regexConstraintOperator');
    const isSemverGteOperatorsEnabled = useUiFlag(
        'semverGteConstraintOperators',
    );
    const isIpOperatorEnabled = useUiFlag('ipConstraintOperator');

    const operators = options
        .filter(
            (operator) => isRegexOperatorEnabled || !isRegexOperator(operator),
        )
        .filter(
            (operator) =>
                isSemverGteOperatorsEnabled ||
                (operator !== SEMVER_GTE && operator !== SEMVER_LTE),
        )
        .filter((operator) => isIpOperatorEnabled || !isCidrOperator(operator));

    const invertedDisabled = Boolean(invertedDisabledText);

    const matchToggle = (
        <StyledMatchToggle>
            <StyledMatchButtonGroup
                exclusive
                value={inverted ? 'does-not-match' : 'matches'}
                onChange={(_, choice) => {
                    if (choice) onToggleInverted();
                }}
                disabled={invertedDisabled}
                aria-label='Match type'
            >
                <StyledMatchButton value='matches'>matches</StyledMatchButton>
                <StyledMatchButton value='does-not-match'>
                    does not match
                </StyledMatchButton>
            </StyledMatchButtonGroup>
        </StyledMatchToggle>
    );

    return (
        <>
            <TriggerButton
                type='button'
                ref={triggerRef}
                variant='outlined'
                color='inherit'
                size='medium'
                endIcon={<KeyboardArrowDownOutlined />}
                aria-label='Operator'
                aria-haspopup='listbox'
                aria-expanded={open}
                onClick={() => setAnchorEl(triggerRef.current)}
            >
                {formatOperatorDescription(value, inverted)}
            </TriggerButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={onClose}
                disableAutoFocus
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        role: 'dialog',
                        sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: (theme) => theme.spacing(42.5),
                            marginTop: (theme) => theme.spacing(1),
                            borderRadius: (theme) =>
                                `${theme.shape.borderRadiusMedium}px`,
                        },
                    },
                }}
            >
                <StyledHeader component='div'>{contextName}</StyledHeader>
                {invertedDisabledText ? (
                    <HtmlTooltip title={invertedDisabledText} arrow>
                        <span>{matchToggle}</span>
                    </HtmlTooltip>
                ) : (
                    matchToggle
                )}
                <StyledMenuList
                    autoFocus
                    autoFocusItem
                    role='listbox'
                    aria-label={`Operator for ${contextName}`}
                >
                    {operators.map((operator) => (
                        <StyledRow
                            key={operator}
                            role='option'
                            selected={operator === value}
                            separator={needSeparatorAbove(operators, operator)}
                            onClick={() => {
                                onChange(operator);
                                onClose();
                            }}
                            aria-selected={operator === value}
                        >
                            <StyledRowHeader>
                                <StyledRowIcon>
                                    {operator === value ? (
                                        <Check fontSize='small' />
                                    ) : null}
                                </StyledRowIcon>
                                <StyledRowTitle>
                                    {formatOperatorDescription(operator)}
                                </StyledRowTitle>
                            </StyledRowHeader>
                            <StyledRowDescription>
                                {operatorExplanations[operator]}
                            </StyledRowDescription>
                        </StyledRow>
                    ))}
                </StyledMenuList>
            </Popover>
        </>
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
    cidrOperators,
];
