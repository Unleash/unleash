import { VFC } from 'react';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    UnfoldMoreOutlined,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './SortArrow.styles';
import classnames from 'classnames';

interface ISortArrowProps {
    isSorted?: boolean;
    isDesc?: boolean;
}

export const SortArrow: VFC<ISortArrowProps> = ({
    isSorted: sorted,
    isDesc: desc = false,
}) => {
    const { classes: styles } = useStyles();

    return (
        <ConditionallyRender
            condition={Boolean(sorted)}
            show={
                <ConditionallyRender
                    condition={Boolean(desc)}
                    show={
                        <KeyboardArrowDown
                            className={classnames(styles.icon, styles.sorted)}
                            fontSize="inherit"
                        />
                    }
                    elseShow={
                        <KeyboardArrowUp
                            className={classnames(styles.icon, styles.sorted)}
                            fontSize="inherit"
                        />
                    }
                />
            }
            elseShow={
                <UnfoldMoreOutlined
                    className={classnames(styles.icon, 'hover-only')}
                    fontSize="inherit"
                />
            }
        />
    );
};
