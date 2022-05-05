import { FC } from 'react';
import { Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './FeatureNameCell.styles';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface IFeatureNameCellProps {
    name?: string;
    project?: string;
    description?: string;
}

export const FeatureNameCell: FC<IFeatureNameCellProps> = ({
    name,
    project,
    description,
}) => {
    const { classes: styles } = useStyles();
    const search = useSearchHighlightContext();

    return (
        <>
            <Link
                component={RouterLink}
                to={`/projects/${project}/features/${name}`}
                underline="hover"
                data-loading
            >
                <Highlighter search={search}>{name}</Highlighter>
            </Link>

            <ConditionallyRender
                condition={Boolean(description)}
                show={
                    <>
                        <br />
                        <Typography
                            className={styles.description}
                            component="span"
                            data-loading
                        >
                            <Highlighter search={search}>
                                {description}
                            </Highlighter>
                        </Typography>
                    </>
                }
            />
        </>
    );
};
