import * as React from 'react';
import { AppBar, Toolbar, Button, Typography, useMediaQuery, useTheme, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, makeStyles, Theme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';

interface AppRoute {
    label: string;
    path?: string;
}

const Header: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    const showHeaderNavigation = useMediaQuery(theme.breakpoints.up('sm'));

    const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);

    const toggleDrawer = () => {
        setOpenDrawer(p => !p);
    };

    const downloadResume = () => {
        console.log('downloading resume');
        toggleDrawer();
    };
    
    const routes: AppRoute[] = [
        {
            label: 'About',
            path: '/about'
        }, {
            label: 'Portfolio',
            path: '/portfolio'
        }, {
            label: 'Resume'
        }, {
            label: 'Contact',
            path: '/contact'
        }
    ];

    const handleClick = (route: AppRoute) => {
        if (route.label == 'Resume') {
            downloadResume();
        } else if (route.path) {
            navigate(route.path);
        }
        setOpenDrawer(false);
    };

    return (
        <>
            <AppBar className='header' elevation={0}>
                <Toolbar className='header-content'>
                    <div className='header-icon' onClick={() => navigate('/')}>
                        <Typography className='header-icon-text'>
                            tk
                        </Typography>
                    </div>
                    {showHeaderNavigation
                        ? (
                            <div className='header-buttons'>
                                {routes.map((route) => (
                                    <Button
                                        className={`header-button ${location.pathname == route.path ? 'active' : ''}`}
                                        key={route.label}
                                        onClick={() => handleClick(route)}
                                        size='small'
                                    >
                                        {route.label}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <IconButton onClick={toggleDrawer}>
                                <MenuIcon />
                            </IconButton>
                        )
                    }
                </Toolbar>
            </AppBar>
            <Drawer
                className='header-drawer'
                anchor='top'
                open={openDrawer}
                onClose={toggleDrawer}
            >
                <List>
                    {routes.map((route) => (
                        <ListItem
                            key={route.label}
                            disablePadding
                            onClick={() => handleClick(route)}
                        >
                            <ListItemButton>
                                <ListItemText primary={route.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default Header;