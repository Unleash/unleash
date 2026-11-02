import {
    alpha,
    Button,
    ButtonBase,
    InputAdornment,
    Popper,
    type InputBaseComponentProps,
    styled,
    TextField,
    type Theme,
} from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import {
    type ChangeEvent,
    type FC,
    type FocusEvent,
    type FocusEventHandler,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
    type RefObject,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

const usePopperAnchor = (onClose: (manageFocus: boolean) => void) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const onContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!anchorEl?.contains(e.relatedTarget as Node | null)) {
            onClose(false);
        }
    };

    const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation(); // don't also close an outer dialog
            onClose(true);
        }
    };

    return { anchorEl, setAnchorEl, onContainerBlur, onPanelKeyDown };
};

const useSelectOnFirstFocus = () => {
    const hasAutoSelected = useRef(false);
    return (e: FocusEvent<HTMLInputElement>) => {
        if (!hasAutoSelected.current) {
            hasAutoSelected.current = true;
            e.target.select();
        }
    };
};

type LockablePlacement = 'bottom-start' | 'top-start';

const useLockedFlipPlacement = (initialPlacement: LockablePlacement) => {
    const [placement, setPlacement] = useState(initialPlacement);
    const [flipEnabled, setFlipEnabled] = useState(true);

    const popperOptions = useMemo(
        () => ({
            strategy: 'fixed' as const,
            onFirstUpdate: (state: { placement?: string }) => {
                if (
                    state.placement === 'top-start' ||
                    state.placement === 'bottom-start'
                ) {
                    setPlacement(state.placement);
                }
                setFlipEnabled(false);
            },
        }),
        [],
    );

    const modifiers = useMemo(
        () => [
            {
                name: 'flip',
                enabled: flipEnabled,
                options: { boundary: document.body },
            },
            { name: 'preventOverflow', options: { boundary: document.body } },
        ],
        [flipEnabled],
    );

    return { placement, popperOptions, modifiers };
};

const Container = styled('div')({
    display: 'flex',
});

const InputArea = styled('div')({
    display: 'contents',
});

const inputSx = (theme: Theme) => ({
    width: 150,
    '& fieldset': {
        borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
        borderWidth: '1.5px',
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
});

const AddAdornmentButton = styled(ButtonBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadiusSmall,
    '&.Mui-disabled': {
        color: theme.palette.text.disabled,
    },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.modal,
}));

const FloatingPanel = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 0),
    width: theme.spacing(42),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[8],
}));

const PopoverBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
}));

const HelpText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const ErrorText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const FooterActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const ValueDescriptionBody: FC<{
    error: string;
    helpText?: ReactNode;
    ValuePreview?: FC<{ value: string }>;
    value: string;
    descriptionId: string;
}> = ({ error, helpText, ValuePreview, value, descriptionId }) => {
    if (!(error || helpText || ValuePreview)) return null;
    return (
        <PopoverBody id={descriptionId}>
            {error ? <ErrorText role='alert'>{error}</ErrorText> : null}
            {helpText && !error ? <HelpText>{helpText}</HelpText> : null}
            {ValuePreview ? <ValuePreview value={value} /> : null}
        </PopoverBody>
    );
};

const AddValueButton: FC<{ value: string; onClick: () => void }> = ({
    value,
    onClick,
}) => (
    <InputAdornment position='end'>
        <AddAdornmentButton
            disabled={!value?.trim()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            data-testid='CONSTRAINT_VALUES_ADD_BUTTON'
        >
            Add
        </AddAdornmentButton>
    </InputAdornment>
);

const mergeInputRefs =
    (
        ownRef: RefObject<HTMLInputElement | null>,
        givenRef?: Ref<HTMLInputElement>,
    ) =>
    (node: HTMLInputElement | null) => {
        ownRef.current = node;
        if (typeof givenRef === 'function') givenRef(node);
        else if (givenRef) givenRef.current = node;
    };

type InlineValueChromeProps = {
    inputId: string;
    value: string;
    error: string;
    announcement: string;
    helpText?: ReactNode;
    ValuePreview?: FC<{ value: string }>;
    multiValue?: boolean;
    rootProps?: Record<string, unknown>;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onClose: (manageFocus: boolean) => void;
    submit?: () => boolean;
    htmlInputProps?: InputBaseComponentProps;
    footerActions?: ReactNode;
    children?: ReactNode;
};

export const InlineValueChrome: FC<InlineValueChromeProps> = ({
    inputId,
    value,
    error,
    announcement,
    helpText,
    ValuePreview,
    multiValue,
    rootProps,
    inputRef,
    onChange,
    onBlur,
    onKeyDown,
    onClose,
    submit,
    htmlInputProps,
    footerActions,
    children,
}) => {
    const { anchorEl, setAnchorEl, onContainerBlur, onPanelKeyDown } =
        usePopperAnchor(onClose);
    const { placement, popperOptions, modifiers } =
        useLockedFlipPlacement('bottom-start');
    const onFocus = useSelectOnFirstFocus();
    const ownInputRef = useRef<HTMLInputElement | null>(null);
    const descriptionId = useId();
    const footerId = useId();

    const addViaInput = () => {
        ownInputRef.current?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            }),
        );
        ownInputRef.current?.focus();
    };

    const hasDescription = Boolean(error || helpText || ValuePreview);
    const describedBy = hasDescription
        ? `${descriptionId} ${footerId}`
        : footerId;

    return (
        <Container
            ref={setAnchorEl}
            onBlur={onContainerBlur}
            onKeyDown={onPanelKeyDown}
        >
            <ScreenReaderOnly>
                <label htmlFor={inputId}>Constraint Value</label>
            </ScreenReaderOnly>
            <ScreenReaderOnly aria-live='polite'>
                {announcement}
            </ScreenReaderOnly>
            <InputArea {...rootProps}>
                <TextField
                    id={inputId}
                    placeholder='Enter value'
                    value={value}
                    inputRef={mergeInputRefs(ownInputRef, inputRef)}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    size='medium'
                    variant='outlined'
                    autoFocus
                    error={Boolean(error)}
                    slotProps={{
                        htmlInput: {
                            ...htmlInputProps,
                            'aria-describedby': describedBy,
                        },
                        input: {
                            sx: inputSx,
                            endAdornment: (
                                <AddValueButton
                                    value={value}
                                    onClick={addViaInput}
                                />
                            ),
                        },
                    }}
                    data-testid='CONSTRAINT_VALUES_INPUT'
                />
            </InputArea>
            <StyledPopper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement={placement}
                disablePortal
                popperOptions={popperOptions}
                modifiers={modifiers}
            >
                <FloatingPanel>
                    <ValueDescriptionBody
                        error={error}
                        helpText={helpText}
                        ValuePreview={ValuePreview}
                        value={value}
                        descriptionId={descriptionId}
                    />
                    {children}
                    <Footer id={footerId}>
                        <span>
                            Enter to add
                            {multiValue ? ' · comma for many' : ''}
                        </span>
                        <FooterActions>
                            {footerActions}
                            {submit ? (
                                <Button
                                    type='button'
                                    size='small'
                                    onClick={() => {
                                        if (!value?.trim() || submit()) {
                                            onClose(true);
                                        }
                                    }}
                                    sx={{ whiteSpace: 'nowrap' }}
                                    data-testid='CONSTRAINT_VALUES_DONE'
                                >
                                    Done
                                </Button>
                            ) : null}
                        </FooterActions>
                    </Footer>
                </FloatingPanel>
            </StyledPopper>
        </Container>
    );
};
