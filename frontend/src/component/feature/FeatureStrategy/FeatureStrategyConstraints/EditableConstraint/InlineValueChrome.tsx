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
    useMemo,
    useRef,
    useState,
} from 'react';

const usePopperAnchor = (
    onClose: (manageFocus: boolean) => void,
    // lets a consumer whose content has its own exotic focus needs (e.g. a
    // date picker's view transitions) attempt its own recovery and veto the
    // close; returns true if it handled the escape
    onFocusEscape?: () => boolean,
) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    const onContainerBlur = () => {
        // a single focus change can blur more than once before settling;
        // coalesce bursts so only the last one is acted on
        clearTimeout(blurTimeout.current);
        blurTimeout.current = setTimeout(() => {
            if (anchorEl?.contains(document.activeElement)) return;
            if (onFocusEscape?.()) return;
            onClose(false);
        }, 0);
    };

    const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation(); // don't also close an outer dialog
            onClose(true);
        }
    };

    return {
        anchorEl,
        setAnchorEl,
        onContainerBlur,
        onPanelKeyDown,
    };
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

export const inputSx = (theme: Theme) => ({
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

export const AddValueButton: FC<{ value: string; onClick: () => void }> = ({
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

export const fieldDescribedBy = (inputId: string) =>
    `${inputId}-description ${inputId}-footer`;

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

type DefaultInlineValueFieldProps = {
    inputId: string;
    value: string;
    error: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    inputRef?: Ref<HTMLInputElement>;
    htmlInputProps?: InputBaseComponentProps;
};

export const DefaultInlineValueField: FC<DefaultInlineValueFieldProps> = ({
    inputId,
    value,
    error,
    onChange,
    onKeyDown,
    onBlur,
    inputRef,
    htmlInputProps,
}) => {
    const onFocus = useSelectOnFirstFocus();
    const ownInputRef = useRef<HTMLInputElement | null>(null);

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

    return (
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
                    'aria-describedby': fieldDescribedBy(inputId),
                },
                input: {
                    sx: inputSx,
                    endAdornment: (
                        <AddValueButton value={value} onClick={addViaInput} />
                    ),
                },
            }}
            data-testid='CONSTRAINT_VALUES_INPUT'
        />
    );
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
    onClose: (manageFocus: boolean) => void;
    onFocusEscape?: () => boolean;
    submit?: () => boolean;
    footerActions?: ReactNode;
    field: ReactNode;
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
    onClose,
    onFocusEscape,
    submit,
    footerActions,
    field,
    children,
}) => {
    const { anchorEl, setAnchorEl, onContainerBlur, onPanelKeyDown } =
        usePopperAnchor(onClose, onFocusEscape);
    const { placement, popperOptions, modifiers } =
        useLockedFlipPlacement('bottom-start');
    const descriptionId = `${inputId}-description`;
    const footerId = `${inputId}-footer`;

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
            <InputArea {...rootProps}>{field}</InputArea>
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
