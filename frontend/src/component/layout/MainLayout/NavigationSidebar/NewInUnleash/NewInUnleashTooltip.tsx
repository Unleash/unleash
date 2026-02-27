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
import type { Link as RouterLink } from 'react-router-dom';
import OpenInNew from '@mui/icons-material/OpenInNew';
import UnleashLogo from 'assets/img/logoWithWhiteText.svg?react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';

const Header = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: `${theme.shape.borderRadiusMedium}px ${theme.shape.borderRadiusMedium}px 0 0`, // has to match the parent tooltip container
    margin: theme.spacing(-1, -1.5, 0, -1.5), // has to match the parent tooltip container
}));

const Body = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    lineHeight: 1.5,
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
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    ul: {
        margin: 0,
        paddingLeft: theme.spacing(2),
    },
}));

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    padding: theme.spacing(1, 0, 2, 0),
    lineHeight: 1.5,
}));

const ReadMore = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
}));

const StyledCheckItOutButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const NewInUnleashTooltip: FC<{
    children: React.ReactElement<any, any>;
    title: string;
    longDescription: ReactNode;
    docsLink?: string;
    onCheckItOut?: () => void;
    open: boolean;
    preview?: ReactNode;
    onClose: () => void;
    beta: boolean;
}> = ({
    children,
    title,
    longDescription,
    onCheckItOut,
    docsLink,
    preview,
    open,
    onClose,
    beta,
}) => (
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
                        <StyledTitle>
                            <Typography>{title}</Typography>
                            <ConditionallyRender
                                condition={beta}
                                show={<Badge color='secondary'>Beta</Badge>}
                            />
                        </StyledTitle>
                        <LongDescription>{longDescription}</LongDescription>
                        <ConditionallyRender
                            condition={Boolean(docsLink)}
                            show={
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
                            }
                        />
                        <ConditionallyRender
                            condition={Boolean(onCheckItOut)}
                            show={
                                <StyledCheckItOutButton
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    size='small'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onClose();
                                        onCheckItOut!();
                                    }}
                                >
                                    Check it out
                                </StyledCheckItOutButton>
                            }
                        />
                    </Body>
                </Box>
            </ClickAwayListener>
        }
    >
        <div>{children}</div>
    </HtmlTooltip>
);
