import { useStyles } from './FormTemplate.styles';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import Codebox from '../Codebox/Codebox';
import { Collapse, IconButton, useMediaQuery } from '@material-ui/core';
import { FileCopy, Info } from '@material-ui/icons';
import ConditionallyRender from '../ConditionallyRender';
import Loader from '../Loader/Loader';
import copy from 'copy-to-clipboard';
import useToast from '../../../hooks/useToast';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as MobileGuidanceBG } from '../../../assets/img/mobile-guidance-bg.svg';
import { useCommonStyles } from 'common.styles';

interface ICreateProps {
    title: string;
    description: string;
    documentationLink: string;
    loading?: boolean;
    modal?: boolean;
    formatApiCode: () => string;
}

// Components in this file:
// FormTemplate
// MobileGuidance
// Guidance

const FormTemplate: React.FC<ICreateProps> = ({
    title,
    description,
    children,
    documentationLink,
    loading,
    modal,
    formatApiCode,
}) => {
    const { setToastData } = useToast();
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const smallScreen = useMediaQuery(`(max-width:${900}px)`);

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
                    <div className={commonStyles.relative}>
                        <MobileGuidance
                            description={description}
                            documentationLink={documentationLink}
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
                            <h2 className={styles.title}>{title}</h2>
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
                    >
                        <h3 className={styles.subtitle}>
                            API Command{' '}
                            <IconButton onClick={copyCommand}>
                                <FileCopy className={styles.icon} />
                            </IconButton>
                        </h3>
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
}

const MobileGuidance = ({
    description,
    documentationLink,
}: IMobileGuidance) => {
    const [open, setOpen] = useState(false);
    const styles = useStyles();

    return (
        <>
            <div className={styles.mobileGuidanceBgContainer}>
                <MobileGuidanceBG className={styles.mobileGuidanceBackground} />
            </div>
            <IconButton
                className={styles.mobileGuidanceButton}
                onClick={() => setOpen(prev => !prev)}
            >
                <Info className={styles.infoIcon} />
            </IconButton>
            <Collapse in={open} timeout={500}>
                <Guidance
                    description={description}
                    documentationLink={documentationLink}
                />
            </Collapse>
        </>
    );
};

interface IGuidanceProps {
    description: string;
    documentationLink: string;
}

const Guidance: React.FC<IGuidanceProps> = ({
    description,
    children,
    documentationLink,
}) => {
    const styles = useStyles();

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
                    Learn more
                </a>
            </div>

            {children}
        </aside>
    );
};

export default FormTemplate;
