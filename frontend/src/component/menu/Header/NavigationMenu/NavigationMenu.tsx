import { Divider } from '@mui/material';
import { Menu, MenuItem, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { INavigationMenuItem } from 'interfaces/route';
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
    const { uiConfig, isPro } = useUiConfig();
    const showUpdatedMenu = uiConfig?.flags?.frontendNavigationUpdate;

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            if (
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise') &&
                showUpdatedMenu
            ) {
                return true;
            }

            return false;
        },
        [isPro, showUpdatedMenu]
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
                .map((option, i) => [
                    <ConditionallyRender
                        key={`${option.path}-divider`}
                        condition={Boolean(
                            showUpdatedMenu &&
                                options[i - 1]?.group &&
                                options[i - 1]?.group !== option.group
                        )}
                        show={<Divider variant="middle" />}
                        elseShow={null}
                    />,
                    <MenuItem
                        key={option.path}
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
                    </MenuItem>,
                ])
                .flat()
                .filter(Boolean)}
        </Menu>
    );
};
