import { useStyles } from './ProjectInfo.styles';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import classnames from 'classnames';

import { useCommonStyles } from '../../../../common.styles';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import PercentageCircle from '../../../common/PercentageCircle/PercentageCircle';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    featureCount: number;
    health: number;
}

const ProjectInfo = ({
    id,
    memberCount,
    featureCount,
    health,
}: IProjectInfoProps) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/access`;
    }

    return (
        <aside>
            <div className={styles.projectInfo}>
                <div className={styles.infoSection}>
                    <div data-loading className={styles.percentageContainer}>
                        <PercentageCircle percentage={health} />
                    </div>
                    <p className={styles.subtitle} data-loading>
                        Overall health rating
                    </p>
                    <p className={styles.emphazisedText} data-loading>
                        {health}%
                    </p>
                    <Link
                        data-loading
                        className={classnames(
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
                            styles.infoLink
                        )}
                        to={`/projects/${id}/health`}
                    >
                        <span className={styles.linkText} data-loading>
                            view more{' '}
                        </span>
                        <ArrowForwardIcon
                            data-loading
                            className={styles.arrowIcon}
                        />
                    </Link>
                </div>

                <div className={styles.infoSection}>
                    <p className={styles.subtitle} data-loading>
                        Feature toggles
                    </p>
                    <p className={styles.emphazisedText} data-loading>
                        {featureCount}
                    </p>
                </div>

                <div
                    className={styles.infoSection}
                    style={{ marginBottom: '0' }}
                >
                    <p className={styles.subtitle} data-loading>
                        Project members
                    </p>
                    <p data-loading className={styles.emphazisedText}>
                        {memberCount}
                    </p>
                    <Link
                        data-loading
                        className={classnames(
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
                            styles.infoLink
                        )}
                        to={link}
                    >
                        <span className={styles.linkText} data-loading>
                            view more{' '}
                        </span>
                        <ArrowForwardIcon
                            data-loading
                            className={styles.arrowIcon}
                        />
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default ProjectInfo;
