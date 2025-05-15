import Clear from '@mui/icons-material/Clear';
import { Chip, type ChipProps, styled, type Theme } from '@mui/material';
import { type FC, forwardRef, type PropsWithChildren, useRef } from 'react';

const ValueListWrapper = styled('div')({
    display: 'contents',
});

const StyledList = styled('ul')({
    listStyle: 'none',
    display: 'contents',
});

export const baseChipStyles = (theme: Theme) => ({
    ':hover': { background: theme.palette.secondary.light },
    ':focus-visible': {
        background: theme.palette.background.elevation1,
        outlineColor: theme.palette.secondary.dark,
    },
    background: theme.palette.background.elevation1,
    color: theme.palette.text.primary,
    height: 'auto',
    outline: `1px solid #0000`,
    transition: 'all 0.3s ease',
});

export const ValueChip = styled(
    forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
        <Chip size='small' {...props} ref={ref} deleteIcon={<Clear />} />
    )),
)(({ theme }) => ({
    ...baseChipStyles(theme),
    color: theme.palette.text.primary,
    padding: 0,
    height: 'auto',
    '& .MuiChip-label': {
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1.5),
    },
    '& .MuiChip-deleteIcon': {
        marginRight: theme.spacing(1),
    },
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

type Props = {
    values?: string[];
    removeValue: (value: string) => void;
    // the element that should receive focus when all value chips are deleted
    getExternalFocusTarget: () => HTMLElement | null;
};

export const ValueList: FC<PropsWithChildren<Props>> = ({
    values = [],
    removeValue,
    getExternalFocusTarget,
    children,
}) => {
    const constraintElementRefs: React.MutableRefObject<
        (HTMLDivElement | null)[]
    > = useRef([]);

    const nextFocusTarget = (deletedIndex: number) => {
        if (deletedIndex === values.length - 1) {
            if (deletedIndex === 0) {
                return getExternalFocusTarget();
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
                            sx={{
                                height: 'auto',
                                '& .MuiChip-label': {
                                    display: 'block',
                                    whiteSpace: 'normal',
                                },
                            }}
                            label={value}
                            onDelete={() => {
                                nextFocusTarget(index)?.focus();
                                removeValue(value);
                            }}
                        />
                    </li>
                ))}
            </StyledList>
            {children}
        </ValueListWrapper>
    );
};
