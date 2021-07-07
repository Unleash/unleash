import { Paper } from '@material-ui/core';
import { useStyles } from './ProjectInfo.styles';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import classnames from 'classnames';

import { ReactComponent as ProjectIcon } from '../../../../assets/icons/projectIcon.svg';
import { useCommonStyles } from '../../../../common.styles';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';

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
            <Paper className={styles.projectInfo}>
                <div className={styles.infoSection} data-loading>
                    <ProjectIcon />
                </div>

                <div className={styles.infoSection} data-loading>
                    <p className={styles.subtitle}>Overall health rating</p>
                    <p className={styles.emphazisedText}>{health}%</p>
                    <Link
                        className={classnames(
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
                            styles.infoLink
                        )}
                        to="/reporting"
                    >
                        view more{' '}
                        <ArrowForwardIcon className={styles.arrowIcon} />
                    </Link>
                </div>

                <div className={styles.infoSection} data-loading>
                    <p className={styles.subtitle}>Project members</p>
                    <p className={styles.emphazisedText}>{memberCount}</p>
                    <Link
                        className={classnames(
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
                            styles.infoLink
                        )}
                        to={link}
                    >
                        view more{' '}
                        <ArrowForwardIcon className={styles.arrowIcon} />
                    </Link>
                </div>

                <div className={styles.infoSection} data-loading>
                    <p className={styles.subtitle}>Feature toggles</p>
                    <p className={styles.emphazisedText}>{featureCount}</p>
                </div>
            </Paper>
        </aside>
    );
};

export default ProjectInfo;
