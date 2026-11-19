import { type ComponentProps, type ReactNode, useId } from 'react';
import { styled } from '@mui/material';

const StyledPane = styled('section')(({ theme }) => ({
    minWidth: 0,
    minHeight: 0,
    height: 400,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.up('sm')]: {
        flex: 1,
        height: '100%',
    },
}));

const StyledPaneHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
    height: theme.spacing(7.5),
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: theme.typography.fontWeightBold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledAside = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledPaneBody = styled('div')({
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    '& > *': {
        height: '100%',
    },
});

type IPayloadSchemaPaneProps = Omit<ComponentProps<'section'>, 'title'> & {
    title: string;
    aside?: ReactNode;
};

export const PayloadSchemaPane = ({
    title,
    aside,
    children,
    ...sectionProps
}: IPayloadSchemaPaneProps) => {
    const titleId = useId();

    return (
        <StyledPane aria-labelledby={titleId} {...sectionProps}>
            <StyledPaneHeader>
                <StyledTitle id={titleId}>{title}</StyledTitle>
                <StyledAside>{aside}</StyledAside>
            </StyledPaneHeader>
            <StyledPaneBody>{children}</StyledPaneBody>
        </StyledPane>
    );
};
