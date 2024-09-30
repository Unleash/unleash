import type * as React from 'react';
import type { FC, ReactNode } from 'react';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import {
    Box,
    Button,
    Link,
    styled,
    Typography,
    ClickAwayListener,
} from '@mui/material';
import { type Link as RouterLink, useNavigate } from 'react-router-dom';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { ReactComponent as UnleashLogo } from 'assets/img/logoWithWhiteText.svg';

const Header = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: `${theme.shape.borderRadiusMedium}px ${theme.shape.borderRadiusMedium}px 0 0`, // has to match the parent tooltip container
    margin: theme.spacing(-1, -1.5, 0, -1.5), // has to match the parent tooltip container
}));

const Body = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledLink = styled(Link<typeof RouterLink | 'a'>)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: 0,
    color: theme.palette.links,
    fontWeight: theme.fontWeight.medium,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledOpenInNew = styled(OpenInNew)(({ theme }) => ({
    fontSize: theme.spacing(2.25),
}));

const BottomPreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 2, 0, 2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    '> svg': { display: 'block', width: '100%', height: 'auto' },
}));

const CenteredPreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '> svg': { display: 'block', width: '70%', height: 'auto' },
}));

const LongDescription = styled(Box)(({ theme }) => ({
    ul: {
        paddingLeft: theme.spacing(2),
    },
}));

const Title = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(1, 0, 2, 0),
}));

const ReadMore = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 0, 4, 0),
}));

export const NewInUnleashTooltip: FC<{
    children: React.ReactElement<any, any>;
    title: string;
    longDescription: ReactNode;
    docsLink: string;
    link: string;
    open: boolean;
    preview?: ReactNode;
    onClose: () => void;
}> = ({
    children,
    title,
    longDescription,
    link,
    docsLink,
    preview,
    open,
    onClose,
}) => {
    const navigate = useNavigate();

    return (
        <HtmlTooltip
            disableFocusListener
            disableHoverListener
            disableTouchListener
            onClose={onClose}
            open={open}
            maxHeight={800}
            maxWidth={350}
            arrow
            tabIndex={0}
            placement='right-end'
            title={
                <ClickAwayListener onClickAway={onClose}>
                    <Box>
                        <Header>
                            {preview ? (
                                <BottomPreview>{preview}</BottomPreview>
                            ) : (
                                <CenteredPreview>
                                    <UnleashLogo />
                                </CenteredPreview>
                            )}
                        </Header>
                        <Body>
                            <Title>{title}</Title>
                            <LongDescription>{longDescription}</LongDescription>
                            <ReadMore>
                                <StyledLink
                                    component='a'
                                    href={docsLink}
                                    underline='hover'
                                    rel='noopener noreferrer'
                                    target='_blank'
                                >
                                    <StyledOpenInNew /> Read more in our
                                    documentation
                                </StyledLink>
                            </ReadMore>
                            <Button
                                variant='contained'
                                color='primary'
                                type='submit'
                                size='small'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onClose();
                                    navigate(link);
                                }}
                            >
                                Check it out
                            </Button>
                        </Body>
                    </Box>
                </ClickAwayListener>
            }
        >
            {children}
        </HtmlTooltip>
    );
};
