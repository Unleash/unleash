import Clear from '@mui/icons-material/Clear';
import { Chip, type ChipProps, styled } from '@mui/material';
import { type FC, forwardRef, type PropsWithChildren, useRef } from 'react';

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
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.border}`,
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
    ':hover, :focus-visible': {
        background: theme.palette.secondary.light,
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

type Props = {
    values: string[] | undefined;
    removeValue: (index: number) => void;
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
            {children}
        </ValueListWrapper>
    );
};
