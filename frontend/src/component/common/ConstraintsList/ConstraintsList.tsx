import { Children, isValidElement, type FC, type ReactNode } from 'react';
import { styled } from '@mui/material';

const StyledList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    gap: theme.spacing(1),
}));

const StyledListItem = styled('li')(({ theme }) => ({
    position: 'relative',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.default,
}));

const StyledAnd = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.5),
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    padding: theme.spacing(0.75, 1),
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    background: theme.palette.background.application,
    borderRadius: theme.shape.borderRadiusLarge,
    zIndex: theme.zIndex.fab,
}));

export const ConstraintsList: FC<{ children: ReactNode }> = ({ children }) => {
    const result: ReactNode[] = [];
    Children.forEach(children, (child, index) => {
        if (isValidElement(child)) {
            result.push(
                <StyledListItem key={index}>
                    {index > 0 ? (
                        <StyledAnd role='separator' key={`${index}-divider`}>
                            AND
                        </StyledAnd>
                    ) : null}
                    {child}
                </StyledListItem>,
            );
        }
    });

    return <StyledList>{result}</StyledList>;
};
