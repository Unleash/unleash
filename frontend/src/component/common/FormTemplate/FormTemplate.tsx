import { useStyles } from './FormTemplate.styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Codebox from '../Codebox/Codebox';
import {
    Collapse,
    IconButton,
    useMediaQuery,
    Tooltip,
    Divider,
} from '@mui/material';
import { FileCopy, Info } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Loader from '../Loader/Loader';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as MobileGuidanceBG } from 'assets/img/mobileGuidanceBg.svg';
import { useThemeStyles } from 'themes/themeStyles';

interface ICreateProps {
    title: string;
    description: string;
    documentationLink: string;
    documentationLinkLabel: string;
    loading?: boolean;
    modal?: boolean;
    formatApiCode: () => string;
}

const FormTemplate: React.FC<ICreateProps> = ({
    title,
    description,
    children,
    documentationLink,
    documentationLinkLabel,
    loading,
    modal,
    formatApiCode,
}) => {
    const { setToastData } = useToast();
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const smallScreen = useMediaQuery(`(max-width:${1099}px)`);

    const copyCommand = () => {
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
    };

    return (
        <section
            className={classNames(styles.container, modal && styles.modal)}
        >
            <ConditionallyRender
                condition={smallScreen}
                show={
                    <div className={themeStyles.relative}>
                        <MobileGuidance
                            description={description}
                            documentationLink={documentationLink}
                            documentationLinkLabel={documentationLinkLabel}
                        />
                    </div>
                }
            />
            <div className={styles.formContent}>
                <ConditionallyRender
                    condition={loading || false}
                    show={<Loader />}
                    elseShow={
                        <>
                            <h1 className={styles.title}>{title}</h1>
                            {children}
                        </>
                    }
                />{' '}
            </div>
            <ConditionallyRender
                condition={!smallScreen}
                show={
                    <Guidance
                        description={description}
                        documentationLink={documentationLink}
                        documentationLinkLabel={documentationLinkLabel}
                    >
                        <Divider className={styles.sidebarDivider} />
                        <h2 className={styles.subtitle}>
                            API Command{' '}
                            <Tooltip title="Copy command" arrow>
                                <IconButton onClick={copyCommand} size="large">
                                    <FileCopy className={styles.icon} />
                                </IconButton>
                            </Tooltip>
                        </h2>
                        <Codebox text={formatApiCode()} />
                    </Guidance>
                }
            />
        </section>
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
    const { classes: styles } = useStyles();

    return (
        <>
            <div className={styles.mobileGuidanceBgContainer}>
                <MobileGuidanceBG className={styles.mobileGuidanceBackground} />
            </div>
            <Tooltip title="Toggle help" arrow>
                <IconButton
                    className={styles.mobileGuidanceButton}
                    onClick={() => setOpen(prev => !prev)}
                    size="large"
                >
                    <Info className={styles.infoIcon} />
                </IconButton>
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
}

const Guidance: React.FC<IGuidanceProps> = ({
    description,
    children,
    documentationLink,
    documentationLinkLabel = 'Learn more',
}) => {
    const { classes: styles } = useStyles();

    return (
        <aside className={styles.sidebar}>
            <p className={styles.description}>{description}</p>

            <div className={styles.linkContainer}>
                <MenuBookIcon className={styles.linkIcon} />
                <a
                    className={styles.documentationLink}
                    href={documentationLink}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {documentationLinkLabel}
                </a>
            </div>

            {children}
        </aside>
    );
};

export default FormTemplate;
