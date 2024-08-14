import type { ComponentProps, FC } from 'react';
import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from 'assets/icons/projectIconSmall.svg';

export const ProjectIcon: FC<ComponentProps<typeof SvgIcon>> = ({
    ...props
}) => <SvgIcon component={Svg} viewBox={'0 0 14 10'} {...props} />;
