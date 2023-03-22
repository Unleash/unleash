import { VFC } from 'react';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    UnfoldMoreOutlined,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import classnames from 'classnames';
import { Theme } from '@mui/material';

interface ISortArrowProps {
    isSorted?: boolean;
    isDesc?: boolean;
    className?: string;
}

const iconStyle = (theme: Theme) => ({
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(-0.5),
    fontSize: theme.fontSizes.mainHeader,
    verticalAlign: 'middle',
});

export const SortArrow: VFC<ISortArrowProps> = ({
    isSorted: sorted,
    isDesc: desc = false,
    className,
}) => (
    <ConditionallyRender
        condition={Boolean(sorted)}
        show={
            <ConditionallyRender
                condition={Boolean(desc)}
                show={
                    <KeyboardArrowDown
                        sx={theme => ({
                            ...iconStyle(theme),
                        })}
                        className={className}
                        fontSize="inherit"
                    />
                }
                elseShow={
                    <KeyboardArrowUp
                        sx={theme => ({
                            ...iconStyle(theme),
                        })}
                        className={className}
                        fontSize="inherit"
                    />
                }
            />
        }
        elseShow={
            <UnfoldMoreOutlined
                sx={theme => ({
                    ...iconStyle(theme),
                })}
                className={classnames(className, 'hover-only')}
                fontSize="inherit"
            />
        }
    />
);
