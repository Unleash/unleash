import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
    Collapse,
    IconButton,
    useMediaQuery,
    Tooltip,
    Divider,
    styled,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Info from '@mui/icons-material/Info';
import Loader from '../Loader/Loader.tsx';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useEventTracker } from 'hooks/useEventTracker';
import React from 'react';
import { type ReactNode, useState } from 'react';
import MobileGuidanceBG from 'assets/img/mobileGuidanceBg.svg?react';
import {
    fitContainerHeightSelector,
    formTemplateFixedSidebarWidth,
    formTemplateFormWidth,
    formTemplatePinnedFooterMediaQuery,
    formTemplateSidebarWidth,
} from './FormTemplate.styles';
import { relative } from 'themes/themeStyles';
import { ApiCommandBlock } from './ApiCommandBlock.tsx';
import { apiCommandTrackingProps } from './apiCommandTrackingProps.ts';

export type FormTemplateLayout = 'modal' | 'compact' | 'page';

interface ICreateProps {
    title?: ReactNode;
    description: ReactNode;
    documentationLink?: string;
    documentationIcon?: ReactNode;
    documentationLinkLabel?: string;
    loading?: boolean;
    layout?: FormTemplateLayout;
    disablePadding?: boolean;
    compactPadding?: boolean;
    showDescription?: boolean;
    showLink?: boolean;
    formatApiCode?: () => string;
    footer?: ReactNode;
    showGuidance?: boolean;
    useFixedSidebar?: boolean;
    sidebarWidth?: string;
    /**
     * Override the entire sidebar contents. The sidebar `<aside>` wrapper
     * (background, width, responsive behavior) is kept; only the contents
     * are replaced. When omitted, the default sidebar (description + docs
     * link + API command) is rendered.
     */
    sidebar?: ReactNode;
    /**
     * Make the template as tall as its container instead of its content, so
     * the content can choose what scrolls. The sidebar scrolls on its own. On
     * short viewports, such as at high zoom, the template grows with its
     * content as usual.
     */
    fitContainerHeight?: boolean;
    children?: React.ReactNode;
}

const StyledContainer = styled('section')(({ theme }) => ({
    borderRadius: theme.spacing(2),
    width: '100%',
    display: 'flex',
    margin: '0 auto',
    [theme.breakpoints.down(1100)]: {
        flexDirection: 'column',
    },
    '&[data-layout="page"]': {
        minHeight: '80vh',
        overflow: 'hidden',
        [theme.breakpoints.down(1100)]: {
            minHeight: 0,
        },
    },
    '&[data-layout="modal"]': {
        minHeight: '100vh',
        borderRadius: 0,
        [`&${fitContainerHeightSelector}`]: {
            '& > aside': { overflowY: 'auto' },
            [formTemplatePinnedFooterMediaQuery]: { height: '100%' },
        },
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
    [`${fitContainerHeightSelector} & aside`]: {
        [formTemplatePinnedFooterMediaQuery]: {
            maxHeight: '25vh',
            overflowY: 'auto',
        },
    },
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
    [`${fitContainerHeightSelector} &`]: { minHeight: 0 },
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
            [`${fitContainerHeightSelector} &`]: { overflowY: 'auto' },
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
    ...theme.typography.h1,
    marginBottom: theme.spacing(2.5),
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
    layout = 'page',
    formatApiCode,
    disablePadding,
    compactPadding = false,
    showDescription = true,
    showLink = true,
    footer,
    showGuidance = true,
    useFixedSidebar,
    sidebarWidth,
    sidebar,
    fitContainerHeight,
}) => {
    const { setToastData } = useToast();
    const { trackEvent } = useEventTracker();
    const smallScreen = useMediaQuery(`(max-width:${1099}px)`);
    const copyCommand = () => {
        if (formatApiCode !== undefined) {
            const command = formatApiCode();
            const copied = copy(command);
            trackEvent('api-command-copied', {
                props: {
                    action: copied ? 'succeeded' : 'failed',
                    ...apiCommandTrackingProps(command),
                },
            });
            if (copied) {
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

    const renderApiInfo = (apiDisabled: boolean, dividerDisabled = false) =>
        apiDisabled ? null : (
            <ApiCommandBlock
                command={formatApiCode!()}
                onCopy={copyCommand}
                hideDivider={dividerDisabled}
            />
        );

    const SidebarComponent = useFixedSidebar ? FixedGuidance : Guidance;

    return (
        <StyledContainer
            data-layout={layout}
            data-fit-container-height={fitContainerHeight}
        >
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
                    sidebar !== undefined ? (
                        <StyledSidebar
                            sidebarWidth={
                                useFixedSidebar
                                    ? formTemplateFixedSidebarWidth
                                    : sidebarWidth
                            }
                        >
                            {sidebar}
                        </StyledSidebar>
                    ) : (
                        <SidebarComponent
                            documentationIcon={documentationIcon}
                            description={description}
                            documentationLink={documentationLink}
                            documentationLinkLabel={documentationLinkLabel}
                            showDescription={showDescription}
                            showLink={showLink}
                            sidebarWidth={sidebarWidth}
                        >
                            {renderApiInfo(
                                formatApiCode === undefined,
                                !(showDescription || showLink),
                            )}
                        </SidebarComponent>
                    )
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
    const { trackEvent } = useEventTracker();

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
                                onClick={() =>
                                    trackEvent('docs-opened', {
                                        props: {
                                            href: documentationLink ?? '',
                                            action: 'clicked',
                                        },
                                    })
                                }
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

const Guidance: React.FC<IGuidanceProps & { sidebarWidth?: string }> = ({
    sidebarWidth,
    ...props
}) => {
    return (
        <StyledSidebar sidebarWidth={sidebarWidth}>
            <GuidanceContent {...props} />
        </StyledSidebar>
    );
};

const FixedGuidance: React.FC<IGuidanceProps & { sidebarWidth?: string }> = ({
    sidebarWidth: _,
    ...props
}) => {
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
