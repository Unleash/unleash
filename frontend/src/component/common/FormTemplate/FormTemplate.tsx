import MenuBookIcon from '@mui/icons-material/MenuBook';
import Codebox from '../Codebox/Codebox';
import {
    Collapse,
    IconButton,
    useMediaQuery,
    Tooltip,
    Divider,
    styled,
} from '@mui/material';
import { FileCopy, Info } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Loader from '../Loader/Loader';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import React, { ReactNode, useState } from 'react';
import { ReactComponent as MobileGuidanceBG } from 'assets/img/mobileGuidanceBg.svg';
import { formTemplateSidebarWidth } from './FormTemplate.styles';
import { relative } from 'themes/themeStyles';

interface ICreateProps {
    title?: ReactNode;
    description: string;
    documentationLink: string;
    documentationLinkLabel: string;
    loading?: boolean;
    modal?: boolean;
    disablePadding?: boolean;
    compactPadding?: boolean;
    showDescription?: boolean;
    showLink?: boolean;
    formatApiCode?: () => string;
    footer?: ReactNode;
    compact?: boolean;
    showGuidance?: boolean;
}

const StyledContainer = styled('section', {
    shouldForwardProp: (prop) =>
        !['modal', 'compact'].includes(prop.toString()),
})<{ modal?: boolean; compact?: boolean }>(({ theme, modal, compact }) => ({
    minHeight: modal ? '100vh' : compact ? 0 : '80vh',
    borderRadius: modal ? 0 : theme.spacing(2),
    width: '100%',
    display: 'flex',
    margin: '0 auto',
    overflow: modal ? 'unset' : 'hidden',
    [theme.breakpoints.down(1100)]: {
        flexDirection: 'column',
        minHeight: 0,
    },
}));

const StyledRelativeDiv = styled('div')(({ theme }) => relative);

const StyledMain = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    [theme.breakpoints.down(1100)]: {
        width: '100%',
    },
}));

const StyledFormContent = styled('div', {
    shouldForwardProp: (prop) => {
        return !['disablePadding', 'compactPadding'].includes(prop.toString());
    },
})<{ disablePadding?: boolean; compactPadding?: boolean }>(
    ({ theme, disablePadding, compactPadding }) => ({
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: disablePadding
            ? 0
            : compactPadding
              ? theme.spacing(4)
              : theme.spacing(6),
        [theme.breakpoints.down('lg')]: {
            padding: disablePadding ? 0 : theme.spacing(4),
        },
        [theme.breakpoints.down(1100)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: disablePadding ? 0 : theme.spacing(4, 2),
        },
    }),
);

const StyledFooter = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4, 6),
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(4),
    },
    [theme.breakpoints.down(500)]: {
        padding: theme.spacing(4, 2),
    },
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    marginBottom: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
}));

const StyledSidebarDivider = styled(Divider)(({ theme }) => ({
    opacity: 0.3,
    marginBottom: theme.spacing(0.5),
}));

const StyledSubtitle = styled('h2')(({ theme }) => ({
    color: theme.palette.common.white,
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledIcon = styled(FileCopy)(({ theme }) => ({
    fill: theme.palette.primary.contrastText,
}));

const StyledMobileGuidanceContainer = styled('div')(() => ({
    zIndex: 1,
    position: 'absolute',
    right: -3,
    top: -3,
}));

const StyledMobileGuidanceBackground = styled(MobileGuidanceBG)(() => ({
    width: '75px',
    height: '75px',
}));

const StyledMobileGuidanceButton = styled(IconButton)(() => ({
    position: 'absolute',
    zIndex: 400,
    right: 0,
}));

const StyledInfoIcon = styled(Info)(({ theme }) => ({
    fill: theme.palette.primary.contrastText,
}));

const StyledSidebar = styled('aside')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(4),
    flexGrow: 0,
    flexShrink: 0,
    width: formTemplateSidebarWidth,
    [theme.breakpoints.down(1100)]: {
        width: '100%',
        color: 'red',
    },
    [theme.breakpoints.down(500)]: {
        padding: theme.spacing(4, 2),
    },
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.common.white,
    zIndex: 1,
    position: 'relative',
}));

const StyledLinkContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
    display: 'flex',
    alignItems: 'center',
}));

const StyledLinkIcon = styled(MenuBookIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
    color: theme.palette.primary.contrastText,
}));

const StyledDocumentationLink = styled('a')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    display: 'block',
    '&:hover': {
        textDecoration: 'none',
    },
}));

const FormTemplate: React.FC<ICreateProps> = ({
    title,
    description,
    children,
    documentationLink,
    documentationLinkLabel,
    loading,
    modal,
    formatApiCode,
    disablePadding,
    compactPadding = false,
    showDescription = true,
    showLink = true,
    footer,
    compact,
    showGuidance = true,
}) => {
    const { setToastData } = useToast();
    const smallScreen = useMediaQuery(`(max-width:${1099}px)`);
    const copyCommand = () => {
        if (formatApiCode !== undefined) {
            if (copy(formatApiCode())) {
                setToastData({
                    title: 'Successfully copied the command',
                    text: 'The command should now be automatically copied to your clipboard',
                    autoHideDuration: 6000,
                    type: 'success',
                    show: true,
                });
            } else {
                setToastData({
                    title: 'Could not copy the command',
                    text: 'Sorry, but we could not copy the command.',
                    autoHideDuration: 6000,
                    type: 'error',
                    show: true,
                });
            }
        }
    };

    const renderApiInfo = (apiDisabled: boolean, dividerDisabled = false) => {
        if (!apiDisabled) {
            return (
                <>
                    <ConditionallyRender
                        condition={!dividerDisabled}
                        show={<StyledSidebarDivider />}
                    />
                    <StyledSubtitle>
                        API Command{' '}
                        <Tooltip title='Copy command' arrow>
                            <IconButton onClick={copyCommand} size='large'>
                                <StyledIcon />
                            </IconButton>
                        </Tooltip>
                    </StyledSubtitle>
                    <Codebox text={formatApiCode!()} />{' '}
                </>
            );
        }
    };

    return (
        <StyledContainer modal={modal} compact={compact}>
            <ConditionallyRender
                condition={showGuidance && smallScreen}
                show={
                    <StyledRelativeDiv>
                        <MobileGuidance
                            description={description}
                            documentationLink={documentationLink}
                            documentationLinkLabel={documentationLinkLabel}
                        />
                    </StyledRelativeDiv>
                }
            />
            <StyledMain>
                <StyledFormContent
                    disablePadding={disablePadding}
                    compactPadding={compactPadding}
                >
                    <ConditionallyRender
                        condition={loading || false}
                        show={<Loader />}
                        elseShow={
                            <>
                                <ConditionallyRender
                                    condition={title !== undefined}
                                    show={<StyledTitle>{title}</StyledTitle>}
                                />
                                {children}
                            </>
                        }
                    />
                </StyledFormContent>
                <ConditionallyRender
                    condition={footer !== undefined}
                    show={() => (
                        <>
                            <Divider />
                            <StyledFooter>{footer}</StyledFooter>
                        </>
                    )}
                />
            </StyledMain>
            <ConditionallyRender
                condition={showGuidance && !smallScreen}
                show={
                    <Guidance
                        description={description}
                        documentationLink={documentationLink}
                        documentationLinkLabel={documentationLinkLabel}
                        showDescription={showDescription}
                        showLink={showLink}
                    >
                        {renderApiInfo(
                            formatApiCode === undefined,
                            !(showDescription || showLink),
                        )}
                    </Guidance>
                }
            />
        </StyledContainer>
    );
};

interface IMobileGuidance {
    description: string;
    documentationLink: string;
    documentationLinkLabel?: string;
}

const MobileGuidance = ({
    description,
    documentationLink,
    documentationLinkLabel,
}: IMobileGuidance) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <StyledMobileGuidanceContainer>
                <StyledMobileGuidanceBackground />
            </StyledMobileGuidanceContainer>
            <Tooltip title='Toggle help' arrow>
                <StyledMobileGuidanceButton
                    onClick={() => setOpen((prev) => !prev)}
                    size='large'
                >
                    <StyledInfoIcon />
                </StyledMobileGuidanceButton>
            </Tooltip>
            <Collapse in={open} timeout={500}>
                <Guidance
                    description={description}
                    documentationLink={documentationLink}
                    documentationLinkLabel={documentationLinkLabel}
                />
            </Collapse>
        </>
    );
};

interface IGuidanceProps {
    description: string;
    documentationLink: string;
    documentationLinkLabel?: string;
    showDescription?: boolean;
    showLink?: boolean;
}

const Guidance: React.FC<IGuidanceProps> = ({
    description,
    children,
    documentationLink,
    documentationLinkLabel = 'Learn more',
    showDescription = true,
    showLink = true,
}) => {
    return (
        <StyledSidebar>
            <ConditionallyRender
                condition={showDescription}
                show={<StyledDescription>{description}</StyledDescription>}
            />

            <ConditionallyRender
                condition={showLink}
                show={
                    <StyledLinkContainer>
                        <StyledLinkIcon />
                        <StyledDocumentationLink
                            href={documentationLink}
                            rel='noopener noreferrer'
                            target='_blank'
                        >
                            {documentationLinkLabel}
                        </StyledDocumentationLink>
                    </StyledLinkContainer>
                }
            />

            {children}
        </StyledSidebar>
    );
};

export default FormTemplate;
