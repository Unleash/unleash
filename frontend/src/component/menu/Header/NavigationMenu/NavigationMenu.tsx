import { Divider, Tooltip } from '@mui/material';
import { Menu, MenuItem, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { INavigationMenuItem } from 'interfaces/route';
import { Link } from 'react-router-dom';
import { EnterpriseBadge } from '../../../common/EnterpriseBadge/EnterpriseBadge';
import { useCallback } from 'react';

interface INavigationMenuProps {
    options: INavigationMenuItem[];
    id: string;
    anchorEl: any;
    handleClose: () => void;
    style: Object;
}

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    alignItems: 'center',
    display: 'flex',
    color: 'inherit',
    height: '100%',
    width: '100%',
    '&&': {
        // Override MenuItem's built-in padding.
        padding: theme.spacing(1, 2),
    },
}));

const StyledSpan = styled('span')(({ theme }) => ({
    width: '12.5px',
    height: '12.5px',
    display: 'block',
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(2),
    borderRadius: '2px',
}));

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    paddingLeft: theme.spacing(2),
    display: 'flex',
}));

export const NavigationMenu = ({
    options,
    id,
    handleClose,
    anchorEl,
    style,
}: INavigationMenuProps) => {
    const { isPro, isOss } = useUiConfig();

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            if (
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise')
            ) {
                return true;
            }

            return false;
        },
        [isPro],
    );

    return (
        <Menu
            id={id}
            onClose={handleClose}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            style={style}
        >
            {options
                .flatMap((option, i) => {
                    const previousGroup = options[i - 1]?.group;
                    const addDivider =
                        previousGroup &&
                        previousGroup !== option.group &&
                        (!isOss() || option.group === 'log');

                    return [
                        addDivider ? (
                            <Divider variant='middle' key={option.group} />
                        ) : null,
                        <Tooltip
                            title={
                                showBadge(option?.menu?.mode)
                                    ? 'This is an Enterprise feature'
                                    : ''
                            }
                            arrow
                            placement='left'
                            key={option.path}
                        >
                            <MenuItem
                                component={StyledLink}
                                to={option.path}
                                onClick={handleClose}
                            >
                                <StyledSpan />
                                {option.title}
                                <ConditionallyRender
                                    condition={showBadge(option?.menu?.mode)}
                                    show={
                                        <StyledBadgeContainer>
                                            <EnterpriseBadge />
                                        </StyledBadgeContainer>
                                    }
                                />
                            </MenuItem>
                        </Tooltip>,
                    ];
                })
                .filter(Boolean)}
        </Menu>
    );
};
