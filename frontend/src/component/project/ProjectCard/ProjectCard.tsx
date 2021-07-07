import { Card, IconButton } from '@material-ui/core';
import { useStyles } from './ProjectCard.styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { ReactComponent as ProjectIcon } from '../../../assets/icons/projectIcon.svg';
import ConditionallyRender from '../../common/ConditionallyRender';
import { PROJECTCARDACTIONS } from '../../common/flags';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    onHover: () => void;
}

const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
}: IProjectCardProps) => {
    const styles = useStyles();
    return (
        <Card className={styles.projectCard} onMouseEnter={onHover}>
            <div className={styles.header} data-loading>
                <h2 className={styles.title}>{name}</h2>
                <ConditionallyRender
                    condition={PROJECTCARDACTIONS}
                    show={
                        <IconButton data-loading>
                            <MoreVertIcon />
                        </IconButton>
                    }
                />
            </div>
            <div data-loading>
                <ProjectIcon className={styles.projectIcon} />
            </div>
            <div className={styles.info}>
                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {featureCount}
                    </p>
                    <p data-loading>toggles</p>
                </div>
                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {health}%
                    </p>
                    <p data-loading>health</p>
                </div>

                <div className={styles.infoBox}>
                    <p className={styles.infoStats} data-loading>
                        {memberCount}
                    </p>
                    <p data-loading>members</p>
                </div>
            </div>
        </Card>
    );
};

export default ProjectCard;
