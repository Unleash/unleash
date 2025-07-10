import { Children, isValidElement, type FC, type ReactNode } from 'react';
import { styled } from '@mui/material';
import { ConstraintSeparator } from './ConstraintSeparator/ConstraintSeparator.tsx';

const StyledList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    gap: theme.spacing(1),
}));

export const ConstraintListItem = styled('div')(({ theme }) => ({
    position: 'relative',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.default,
    padding: theme.spacing(1.5, 2),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

const StyledListItem = styled('li')({
    position: 'relative',
});

export const ConstraintsList: FC<{ children: ReactNode }> = ({ children }) => {
    const result: ReactNode[] = [];
    Children.forEach(children, (child, index) => {
        if (isValidElement(child)) {
            result.push(
                <StyledListItem key={index}>
                    {index > 0 ? (
                        <ConstraintSeparator key={`${index}-divider`} />
                    ) : null}
                    {child}
                </StyledListItem>,
            );
        }
    });

    return <StyledList>{result}</StyledList>;
};
