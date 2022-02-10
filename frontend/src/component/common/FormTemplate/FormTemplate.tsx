import { useStyles } from './FormTemplate.styles';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import Codebox from '../Codebox/Codebox';
import { IconButton, useMediaQuery } from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import ConditionallyRender from '../ConditionallyRender';
import Loader from '../Loader/Loader';
import copy from 'copy-to-clipboard';
import useToast from '../../../hooks/useToast';

interface ICreateProps {
    title: string;
    description: string;
    documentationLink: string;
    loading?: boolean;
    formatApiCode: () => string;
}

const FormTemplate: React.FC<ICreateProps> = ({
    title,
    description,
    children,
    documentationLink,
    loading,
    formatApiCode,
}) => {
    const { setToastData } = useToast();
    const styles = useStyles();
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
        <section className={styles.container}>
            <aside className={styles.sidebar}>
                <h2 className={styles.title}>{title}</h2>
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
                <ConditionallyRender
                    condition={!smallScreen}
                    show={
                        <>
                            <h3 className={styles.subtitle}>
                                API Command{' '}
                                <IconButton
                                    onClick={copyCommand}
                                >
                                    <FileCopy className={styles.icon} />
                                </IconButton>
                            </h3>
                            <Codebox text={formatApiCode()} />
                        </>
                    }
                />
            </aside>
            <div className={styles.formContent}>
                <ConditionallyRender
                    condition={loading || false}
                    show={<Loader />}
                    elseShow={<>{children}</>}
                />{' '}
            </div>
        </section>
    );
};

export default FormTemplate;
