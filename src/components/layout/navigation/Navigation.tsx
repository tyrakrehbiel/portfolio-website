import React, { FC, useState, useEffect } from 'react';
import { Button, useMediaQuery, useTheme, Drawer, AppBar, Toolbar, ListItem, ListItemButton, List } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, LinkedIn } from '@mui/icons-material';
import { openLink } from '../../../common/utils';

interface AppRoute {
    label: string;
    path?: string;
    url?: string;
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
        label: 'Projects',
        path: '/projects'
    }, {
        label: 'Experience',
        url: 'https://drive.google.com/file/d/1lZT_jhyvQS83g-3mvYOBzQUFKRUyvd55/view?usp=sharing'
    }, {
        label: 'Get in Touch',
        path: '/contact'
    }
];

const logo = 'Tyra K.';

/**
 * Navigation navigation component. Converts to a drawer on small screens.
 * TODO: on portfolio click, open sub menu with art vs case studies
 * @returns 
 */
const Navigation: FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    
    /** show header navigation instead of drawer for screen sizes larger than sm breakpoint */
    // const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const mobile = useMediaQuery('(max-width:700px)');

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

    const closeDrawer = () => {
        setOpenDrawer(false);
    };

    /**
     * Handles clicking navigation button to either navigate to specified route path, or custom onClick
     * @param route 
     */
    const onClick = (route: AppRoute) => {
        if (route.url) {
            openLink(route.url);
        } else if (route.path) {
            navigate(route.path);
        }
        closeDrawer();
    };

    return (
        <AppBar className='navigation' elevation={0}>
            <Toolbar className='content'>
                <div className='logo' onClick={() => navigate('/')}>
                    {logo}
                </div>
                <div className='routes'>
                    {mobile ? (
                        <>
                            <LinkedInBtn closeDrawer={closeDrawer} />
                            <div className='icon-button large' onClick={toggleDrawer}>
                                <MenuIcon />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                {routes.map((route) => (
                                    <Button
                                        className={`navigation-button ${location.pathname == route.path ? 'active' : ''}`}
                                        key={route.label}
                                        onClick={() => onClick(route)}
                                    >
                                        {route.label}
                                    </Button>
                                ))}
                            </div>
                            <LinkedInBtn closeDrawer={closeDrawer} />
                        </>
                    )}
                </div>
            </Toolbar>
            <Drawer
                className='navigation-drawer'
                anchor='top'
                open={openDrawer}
                onClose={toggleDrawer}
            >
                <div className='drawer-list'>
                    {routes.map((route) => (
                        <div
                            key={route.label}
                            className='drawer-list-item'
                            onClick={() => onClick(route)}
                        >
                            <div className={`drawer-list-item-content ${location.pathname == route.path ? 'active' : ''}`}>
                                {route.label}
                            </div>
                        </div>
                    ))}
                </div>
            </Drawer>
        </AppBar>
    );
};

export default Navigation;

const LinkedInBtn: React.FC<{ closeDrawer: () => void; }> = (props) => {

    const toLinkedIn = () => {
        openLink('https://linkedin.com');
        props.closeDrawer();
    };

    return (
        <div className='icon-button' onClick={toLinkedIn}>
            <LinkedIn />
        </div>
    );
};