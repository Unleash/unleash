import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';
import {
    Box,
    Button,
    Chip,
    type ChipProps,
    Popover,
    styled,
} from '@mui/material';
import {
    type FC,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const ValueListWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
}));

const StyledList = styled('ul')({
    listStyle: 'none',
    padding: 0,
    display: 'contents',
});

const ValueChipBase = styled(
    forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
        <Chip size='small' {...props} ref={ref} />
    )),
)(({ theme }) => ({
    transition: 'all 0.3s ease',
    outline: `1px solid #0000`,
    background: theme.palette.background.elevation1,
    ':hover, :focus-visible': {
        background: theme.palette.background.elevation1,
    },
    ':focus-visible': {
        outlineColor: theme.palette.secondary.dark,
    },
}));

const ValueChip = styled(ValueChipBase)(({ theme }) => ({
    svg: {
        fill: theme.palette.secondary.dark,
        borderRadius: '50%',
        outline: `2px solid #0000`,
        transition: 'inherit',
        ':focus-visible,:hover': {
            backgroundColor: theme.palette.table.headerHover,
            outlineColor: theme.palette.table.headerHover,
        },
    },
}));

const AddValuesButton = styled('button')(({ theme }) => ({
    color: theme.palette.primary.main,
    svg: {
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
    border: 'none',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    display: 'flex',
    flexFlow: 'row nowrap',
    whiteSpace: 'nowrap',
    gap: theme.spacing(0.25),
    alignItems: 'center',
    paddingInline: theme.spacing(1.5),
    height: theme.spacing(3),
    transition: 'all 0.3s ease',
    outline: `1px solid #0000`,
    background: theme.palette.background.elevation1,
    ':hover, :focus-visible': {
        background: theme.palette.background.elevation1,
        outlineColor: theme.palette.secondary.dark,
    },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1),
    },
}));

const AddValues = forwardRef<HTMLButtonElement, {}>((props, ref) => {
    const [open, setOpen] = useState(false);
    const positioningRef = useRef<HTMLButtonElement>(null);
    useImperativeHandle(ref, () => positioningRef.current as HTMLButtonElement);

    return (
        <Box>
            <AddValuesButton
                ref={positioningRef}
                onClick={() => setOpen(true)}
                type='button'
            >
                <Add />
                <span>Add values</span>
            </AddValuesButton>
            <StyledPopover
                open={open}
                disableScrollLock
                anchorEl={positioningRef.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <form action='' onSubmit={(e) => e.preventDefault()}>
                    <input type='text' />
                    <Button
                        variant='text'
                        onClick={() => console.log('clicked the add button')}
                    >
                        Add
                    </Button>
                </form>
            </StyledPopover>
        </Box>
    );
});

type Props = {
    values: string[] | undefined;
    removeValue: (index: number) => void;
};

export const ValueList: FC<Props> = ({ values = [], removeValue }) => {
    const constraintElementRefs: React.MutableRefObject<
        (HTMLDivElement | null)[]
    > = useRef([]);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);

    const nextFocusTarget = (deletedIndex: number) => {
        if (deletedIndex === values.length - 1) {
            if (deletedIndex === 0) {
                return addValuesButtonRef.current;
            } else {
                return constraintElementRefs.current[deletedIndex - 1];
            }
        } else {
            return constraintElementRefs.current[deletedIndex + 1];
        }
    };

    return (
        <ValueListWrapper>
            <StyledList>
                {values.map((value, index) => (
                    <li key={value}>
                        <ValueChip
                            ref={(el) => {
                                constraintElementRefs.current[index] = el;
                            }}
                            deleteIcon={<Clear />}
                            label={value}
                            onDelete={() => {
                                nextFocusTarget(index)?.focus();
                                removeValue(index);
                            }}
                        />
                    </li>
                ))}
            </StyledList>
            <AddValues ref={addValuesButtonRef} />
        </ValueListWrapper>
    );
};
