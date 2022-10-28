import { Typography } from '@mui/material';
import { useStyles } from 'component/segments/SegmentEmpty/SegmentEmpty.styles';
import { Link } from 'react-router-dom';
import { CREATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { useContext } from 'react';

export const SegmentEmpty = () => {
    const { classes } = useStyles();
    const { hasAccess } = useContext(AccessContext);

    return (
        <div className={classes.empty}>
            <Typography className={classes.title}>No segments yet!</Typography>
            <p className={classes.subtitle}>
                Segment makes it easy for you to define who should be exposed to
                your feature. The segment is often a collection of constraints
                and can be reused.
            </p>
            <ConditionallyRender
                condition={hasAccess(CREATE_SEGMENT)}
                show={
                    <Link to="/segments/create" className={classes.paramButton}>
                        Create your first segment
                    </Link>
                }
            />
        </div>
    );
};
