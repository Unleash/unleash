import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FC, forwardRef } from 'react';

export const StyledIconWrapperBase = styled('div')<{
    prefix?: boolean;
}>(({ theme }) => ({
    backgroundColor: theme.palette.grey[200],
    width: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    color: theme.palette.primary.main,
    marginRight: '1rem',
    borderRadius: theme.shape.borderRadius,
}));

const StyledPrefixIconWrapper = styled(StyledIconWrapperBase)(() => ({
    marginRight: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
}));

export const StyledIconWrapper = forwardRef<
    HTMLDivElement,
    { isPrefix?: boolean; children?: React.ReactNode }
>(({ isPrefix, ...props }, ref) => (
    <ConditionallyRender
        condition={Boolean(isPrefix)}
        show={() => <StyledPrefixIconWrapper ref={ref} {...props} />}
        elseShow={() => <StyledIconWrapperBase ref={ref} {...props} />}
    />
));
