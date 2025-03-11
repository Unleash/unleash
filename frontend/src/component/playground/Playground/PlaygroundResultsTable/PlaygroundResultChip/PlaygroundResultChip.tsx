import type { VFC } from 'react';
import { useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReactComponent as FeatureEnabledIcon } from 'assets/icons/isenabled-true.svg';
import { ReactComponent as FeatureDisabledIcon } from 'assets/icons/isenabled-false.svg';
import WarningOutlined from '@mui/icons-material/WarningOutlined';
import { Badge } from 'component/common/Badge/Badge';

interface IResultChipProps {
    enabled: boolean | 'unevaluated' | 'unknown';
    label: string;
    // Result icon - defaults to true
    showIcon?: boolean;
    tabindex?: number;
}

export const PlaygroundResultChip: VFC<IResultChipProps> = ({
    enabled,
    label,
    showIcon = true,
    tabindex,
}) => {
    const theme = useTheme();
    const icon = (
        <ConditionallyRender
            condition={enabled === 'unknown' || enabled === 'unevaluated'}
            show={<WarningOutlined color={'warning'} fontSize='inherit' />}
            elseShow={
                <ConditionallyRender
                    condition={typeof enabled === 'boolean' && Boolean(enabled)}
                    show={
                        <FeatureEnabledIcon
                            aria-hidden
                            color={theme.palette.success.main}
                            strokeWidth='0.25'
                        />
                    }
                    elseShow={
                        <FeatureDisabledIcon
                            aria-hidden
                            color={theme.palette.error.main}
                            strokeWidth='0.25'
                        />
                    }
                />
            }
        />
    );

    return (
        <ConditionallyRender
            condition={enabled === 'unknown' || enabled === 'unevaluated'}
            show={
                <Badge icon={showIcon ? icon : undefined} color='warning'>
                    {label}
                </Badge>
            }
            elseShow={
                <ConditionallyRender
                    condition={typeof enabled === 'boolean' && Boolean(enabled)}
                    show={
                        <Badge
                            tabIndex={tabindex}
                            color='success'
                            icon={showIcon ? icon : undefined}
                        >
                            {label}
                        </Badge>
                    }
                    elseShow={
                        <Badge
                            color='error'
                            icon={showIcon ? icon : undefined}
                            tabIndex={tabindex}
                        >
                            {label}
                        </Badge>
                    }
                />
            }
        />
    );
};
