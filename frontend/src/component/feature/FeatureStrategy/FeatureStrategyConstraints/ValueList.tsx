import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';
import { Chip, type ChipProps, styled } from '@mui/material';
import { type FC, forwardRef, useRef } from 'react';

const ValueListWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
}));

const ValuesList = styled('ul')({
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

const AddValuesButton = styled(ValueChipBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    svg: {
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
    ':hover': {
        outlineColor: theme.palette.secondary.dark,
    },
}));

type Props = {
    values: string[] | undefined;
    removeValue: (index: number) => void;
};

export const ValueList: FC<Props> = ({ values = [], removeValue }) => {
    const constraintElementRefs: React.MutableRefObject<
        (HTMLDivElement | null)[]
    > = useRef([]);
    const addValueRef = useRef(null);

    const nextFocusTarget = (deletedIndex: number) => {
        if (deletedIndex === values.length - 1) {
            if (deletedIndex === 0) {
                return addValueRef.current;
            } else {
                return constraintElementRefs.current[deletedIndex - 1];
            }
        } else {
            return constraintElementRefs.current[deletedIndex + 1];
        }
    };

    return (
        <ValueListWrapper>
            <ValuesList>
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
            </ValuesList>
            <AddValuesButton
                ref={addValueRef}
                label={'Add values'}
                onClick={() => console.log('adding values')}
                icon={<Add />}
            />
        </ValueListWrapper>
    );
};
