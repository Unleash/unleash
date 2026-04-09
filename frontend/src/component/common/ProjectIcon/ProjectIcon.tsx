import type { ComponentProps, FC } from 'react';
import { SvgIcon } from '@mui/material';
import Svg from 'assets/icons/projectIconSmall.svg?react';

export const ProjectIcon: FC<ComponentProps<typeof SvgIcon>> = ({
    ...props
}) => (
    <SvgIcon
        component={Svg}
        viewBox={'0 0 14 10'}
        data-testid='UnleashProjectIcon'
        {...props}
    />
);
