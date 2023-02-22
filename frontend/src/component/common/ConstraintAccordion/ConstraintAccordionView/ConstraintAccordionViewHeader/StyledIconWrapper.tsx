import { forwardRef, ReactNode } from 'react';
import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const StyledIconWrapperBase = styled('div')<{
    prefix?: boolean;
}>(({ theme }) => ({
    backgroundColor: theme.palette.grey[200],
    width: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledPrefixIconWrapper = styled(StyledIconWrapperBase)(() => ({
    marginLeft: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
}));

export const StyledIconWrapper = forwardRef<
    HTMLDivElement,
    { isPrefix?: boolean; children?: ReactNode }
>(({ isPrefix, ...props }, ref) => (
    <ConditionallyRender
        condition={Boolean(isPrefix)}
        show={() => <StyledPrefixIconWrapper ref={ref} {...props} />}
        elseShow={() => <StyledIconWrapperBase ref={ref} {...props} />}
    />
));
