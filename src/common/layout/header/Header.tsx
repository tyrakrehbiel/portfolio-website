import React, { FC, useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, useMediaQuery, useTheme, IconButton, Drawer } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';

interface AppRoute {
    label: string;
    path?: string;
}

/**
 * List of all application routes. Will be mapped to buttons in navigation.
 * 
 * If no path is provided, a custom onClick will be used
 */
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

/**
 * Header navigation component. Converts to a drawer on small screens.
 * 
 * @returns 
 */
const Header: FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    /** show header navigation instead of drawer for screen sizes larger than sm breakpoint */
    const showHeaderNavigation = useMediaQuery(theme.breakpoints.up('sm'));

    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    useEffect(() => { // close drawer when window size is sm or larger
        const handleResize = () => {
            if (window.innerWidth > theme.breakpoints.values.sm) setOpenDrawer(false);
        };
    
        window.addEventListener('resize', handleResize);
    
        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [theme.breakpoints.values.sm]);

    const toggleDrawer = () => {
        setOpenDrawer(p => !p);
    };

    /**
     * Handles opening resume pdf in Google Drive in another browser tab
     */
    const openResume = () => {
        const pdfUrl = 'https://drive.google.com/file/d/1lZT_jhyvQS83g-3mvYOBzQUFKRUyvd55/view?usp=sharing';
        
        window.open(pdfUrl, '_blank');

        setOpenDrawer(false);
    };

    /**
     * Handles clicking navigation button to either navigate to specified route path, or custom onClick
     * @param route 
     */
    const handleClick = (route: AppRoute) => {
        if (route.label == 'Resume') {
            openResume();
        } else if (route.path) {
            navigate(route.path);
        }
        setOpenDrawer(false);
    };

    /**
     * Map routes to navigation buttons
     * @param drawer 
     * @returns 
     */
    const routeButtons = (drawer: boolean) => (
        routes.map((route) => {
            const drawerClass = drawer ? 'drawer' : '';
            const activeClass = location.pathname == route.path ? 'active' : '';
            return (
                <Button
                    className={`header-button ${drawerClass} ${activeClass}`}
                    key={route.label}
                    onClick={() => handleClick(route)}
                    data-testid='header-button'
                >
                    {route.label}
                </Button>
            );
        })
    );

    return (
        <>
            <AppBar className='header' elevation={0}>
                <Toolbar className='header-content'>
                    <div className='header-icon' onClick={() => navigate('/')}>
                        <Typography className='header-icon-text' data-testid='logo-button'>tk</Typography>
                    </div>
                    {showHeaderNavigation
                        ? (
                            <div className='header-buttons' data-testid='appbar-header-nav'>
                                {routeButtons(false)}
                            </div>
                        ) : (
                            <IconButton onClick={toggleDrawer} data-testid='nav-menu-button'>
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
                data-testid='drawer-header-nav'
            >
                {routeButtons(true)}
            </Drawer>
        </>
    );
};

export default Header;