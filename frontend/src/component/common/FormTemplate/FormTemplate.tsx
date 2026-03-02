import MenuBookIcon from '@mui/icons-material/MenuBook';
import Codebox from '../Codebox/Codebox.tsx';
import {
    Collapse,
    IconButton,
    useMediaQuery,
    Tooltip,
    Divider,
    styled,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import FileCopy from '@mui/icons-material/FileCopy';
import Info from '@mui/icons-material/Info';
import Loader from '../Loader/Loader.tsx';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import React from 'react';
import { type ReactNode, useState } from 'react';
import MobileGuidanceBG from 'assets/img/mobileGuidanceBg.svg?react';
import {
    formTemplateFixedSidebarWidth,
    formTemplateFormWidth,
    formTemplateSidebarWidth,
} from './FormTemplate.styles';
import { relative } from 'themes/themeStyles';

interface ICreateProps {
    title?: ReactNode;
    description: ReactNode;
    documentationLink?: string;
    documentationIcon?: ReactNode;
    documentationLinkLabel?: string;
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
    useFixedSidebar?: boolean;
    children?: React.ReactNode;
}

const StyledContainer = styled('section', {
    shouldForwardProp: (prop) =>
        !['modal', 'compact'].includes(prop.toString()),
})<{ modal?: boolean; compact?: boolean }>(({ theme, modal, compact }) => ({
    minHeight: modal ? '100vh' : compact ? 'unset' : '80vh',
    borderRadius: modal ? 0 : theme.spacing(2),
    width: '100%',
    display: 'flex',
    margin: '0 auto',
    overflow: modal || compact ? 'unset' : 'hidden',
    [theme.breakpoints.down(1100)]: {
        flexDirection: 'column',
        minHeight: 0,
    },
}));

const StyledMobileGuidanceWrapper = styled('div', {
    shouldForwardProp: (prop) => !['guidanceHeight'].includes(prop.toString()),
})<{ guidanceHeight?: string }>(({ theme, guidanceHeight }) => ({
    ...relative,
    // todo: review this. We're reaching down into a nested
    // component, but due to the component structure, it'd be a
    // lot of work to pass this down as a prop.
    ...(guidanceHeight
        ? {
              aside: {
                  height: guidanceHeight,
              },
          }
        : {}),
}));

const StyledMain = styled('div', {
    shouldForwardProp: (prop) => prop !== 'useFixedSidebar',
})<{ useFixedSidebar?: boolean }>(({ theme, useFixedSidebar }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    width: useFixedSidebar ? 'initial' : formTemplateFormWidth,
    [theme.breakpoints.down(1100)]: {
        width: '100%',
    },
}));

const StyledFormContent = styled('div', {
    shouldForwardProp: (prop) => {
        return !['disablePadding', 'compactPadding'].includes(prop.toString());
    },
})<{ disablePadding?: boolean; compactPadding?: boolean }>(
    ({ theme, disablePadding, compactPadding }) => {
        const padding = disablePadding
            ? 0
            : compactPadding
              ? theme.spacing(4)
              : theme.spacing(6);

        const paddingLgDown = disablePadding ? 0 : theme.spacing(4);
        const padding500DownInline = disablePadding ? 0 : theme.spacing(2);
        const padding500DownBlock = disablePadding ? 0 : theme.spacing(4);

        return {
            '--form-content-padding': padding,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding,
            [theme.breakpoints.down('lg')]: {
                padding: paddingLgDown,
                '--form-content-padding': paddingLgDown,
            },
            [theme.breakpoints.down(1100)]: {
                width: '100%',
            },
            [theme.breakpoints.down(500)]: {
                paddingInline: padding500DownInline,
                paddingBlock: padding500DownBlock,
                '--form-content-padding': padding500DownInline,
            },
        };
    },
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

const StyledSidebar = styled('aside', {
    shouldForwardProp: (prop) =>
        !['sidebarWidth', 'fixedCodeHeight'].includes(prop.toString()),
})<{ sidebarWidth?: string; fixedCodeHeight?: string }>(
    ({ theme, sidebarWidth, fixedCodeHeight }) => ({
        backgroundColor: theme.palette.background.sidebar,
        padding: theme.spacing(4),
        flexGrow: 0,
        flexShrink: 0,
        width: sidebarWidth || formTemplateSidebarWidth,
        [theme.breakpoints.down(1100)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: theme.spacing(4, 2),
        },
        ...(fixedCodeHeight
            ? {
                  pre: {
                      height: fixedCodeHeight,
                  },
              }
            : {}),
    }),
);

const StyledDescriptionCard = styled('article')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
    alignItems: 'center',
    zIndex: 1,
    color: theme.palette.common.white,
    position: 'relative',
    marginBlockEnd: theme.spacing(3),
}));

const StyledDescription = styled('div')(() => ({
    width: '100%',
}));

const StyledLinkContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
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
    documentationIcon,
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
    useFixedSidebar,
}) => {
    const { setToastData } = useToast();
    const smallScreen = useMediaQuery(`(max-width:${1099}px)`);
    const copyCommand = () => {
        if (formatApiCode !== undefined) {
            if (copy(formatApiCode())) {
                setToastData({
                    text: 'Command copied',
                    autoHideDuration: 6000,
                    type: 'success',
                    show: true,
                });
            } else {
                setToastData({
                    text: 'Could not copy the command',
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

    const SidebarComponent = useFixedSidebar ? FixedGuidance : Guidance;

    return (
        <StyledContainer modal={modal} compact={compact}>
            <ConditionallyRender
                condition={showGuidance && smallScreen}
                show={
                    <StyledMobileGuidanceWrapper
                        guidanceHeight={useFixedSidebar ? '240px' : undefined}
                    >
                        <MobileGuidance
                            description={description}
                            documentationIcon={documentationIcon}
                            documentationLink={documentationLink}
                            documentationLinkLabel={documentationLinkLabel}
                        />
                    </StyledMobileGuidanceWrapper>
                }
            />
            <StyledMain useFixedSidebar={useFixedSidebar}>
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
                    <SidebarComponent
                        documentationIcon={documentationIcon}
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
                    </SidebarComponent>
                }
            />
        </StyledContainer>
    );
};

interface IMobileGuidance {
    description: ReactNode;
    documentationLink?: string;
    documentationIcon?: ReactNode;
    documentationLinkLabel?: string;
}

const MobileGuidance = ({
    description,
    documentationLink,
    documentationLinkLabel,
    documentationIcon,
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
                    documentationIcon={documentationIcon}
                    description={description}
                    documentationLink={documentationLink}
                    documentationLinkLabel={documentationLinkLabel}
                />
            </Collapse>
        </>
    );
};

interface IGuidanceProps {
    description: ReactNode;
    documentationIcon?: ReactNode;
    documentationLink?: string;
    documentationLinkLabel?: string;
    showDescription?: boolean;
    showLink?: boolean;
    children?: React.ReactNode;
}

const GuidanceContent: React.FC<
    IGuidanceProps & {
        fixedDocumentationHeight?: string;
    }
> = ({
    description,
    children,
    documentationLink,
    documentationIcon,
    documentationLinkLabel = 'Learn more',
    showDescription = true,
    showLink = true,
    fixedDocumentationHeight,
}) => {
    const StyledDocumentationIconWrapper = styled('div')({
        height: '2rem',
        display: 'grid',
        placeItems: 'center',
    });

    const StyledDocumentationWrapper = styled('div')({
        height: fixedDocumentationHeight,
        overflowY: 'auto',
    });

    const DocsWrapper = fixedDocumentationHeight
        ? StyledDocumentationWrapper
        : React.Fragment;

    return (
        <>
            <DocsWrapper>
                <ConditionallyRender
                    condition={showDescription}
                    show={
                        <StyledDescriptionCard>
                            <ConditionallyRender
                                condition={!!documentationIcon}
                                show={
                                    <StyledDocumentationIconWrapper>
                                        {documentationIcon}
                                    </StyledDocumentationIconWrapper>
                                }
                            />
                            <StyledDescription>{description}</StyledDescription>
                        </StyledDescriptionCard>
                    }
                />

                <ConditionallyRender
                    condition={showLink && !!documentationLink}
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
            </DocsWrapper>
            {children}
        </>
    );
};

const Guidance: React.FC<IGuidanceProps> = (props) => {
    return (
        <StyledSidebar>
            <GuidanceContent {...props} />
        </StyledSidebar>
    );
};

const FixedGuidance: React.FC<IGuidanceProps> = (props) => {
    return (
        <StyledSidebar
            sidebarWidth={formTemplateFixedSidebarWidth}
            fixedCodeHeight='300px'
        >
            <GuidanceContent {...props} fixedDocumentationHeight='170px' />
        </StyledSidebar>
    );
};

export default FormTemplate;
