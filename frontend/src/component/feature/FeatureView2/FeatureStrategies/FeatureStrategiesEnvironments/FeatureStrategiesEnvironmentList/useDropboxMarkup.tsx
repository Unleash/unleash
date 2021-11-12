import { GetApp } from '@material-ui/icons';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import classnames from 'classnames';
import { useStyles } from './FeatureStrategiesEnvironmentList.styles';
import { Button } from '@material-ui/core';

const useDropboxMarkup = (
    isOver: boolean,
    expandedSidebar: boolean,
    setExpandedSidbar
) => {
    const styles = useStyles();

    const dropboxClasses = classnames(styles.dropbox, {
        [styles.dropboxActive]: isOver,
    });

    const iconClasses = classnames(styles.dropIcon, {
        [styles.dropIconActive]: isOver,
    });

    return (
        <ConditionallyRender
            condition={expandedSidebar}
            show={
                <>
                    <div className={dropboxClasses}>
                        <p>
                            Drag and drop strategies from the left side strategy
                            panel
                        </p>
                        <GetApp className={iconClasses} />
                    </div>
                    <Button
                        style={{ marginTop: '1rem' }}
                        onClick={() => setExpandedSidbar(false)}
                    >
                        Cancel
                    </Button>
                </>
            }
        />
    );
};

export default useDropboxMarkup;
