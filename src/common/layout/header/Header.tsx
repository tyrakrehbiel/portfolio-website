import * as React from 'react';
import { AppBar, Toolbar, Button, Typography, useMediaQuery, useTheme, IconButton, Drawer } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';

interface AppRoute {
    label: string;
    path?: string;
}

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
 * TODO: on screen size change, close drawer
 * @returns 
 */
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
        const pdfUrl = 'https://drive.google.com/file/d/1lZT_jhyvQS83g-3mvYOBzQUFKRUyvd55/view?usp=sharing';
    
        // Create a hidden anchor element
        const anchor = document.createElement('a');
        anchor.href = pdfUrl;
        anchor.target = '_blank';
        anchor.download = 'Tyra_Krehbiel_Resume.pdf';
    
        // Append the anchor to the body and click it programmatically
        document.body.appendChild(anchor);
        anchor.click();
    
        // Remove the anchor from the body to avoid clutter
        document.body.removeChild(anchor);

        setOpenDrawer(false);
    };

    const handleClick = (route: AppRoute) => {
        if (route.label == 'Resume') {
            downloadResume();
        } else if (route.path) {
            navigate(route.path);
        }
        setOpenDrawer(false);
    };

    const routeButtons = (drawer: boolean) => (
        routes.map((route) => {
            const drawerClass = drawer ? 'drawer' : '';
            const activeClass = location.pathname == route.path ? 'active' : '';
            return (
                <Button
                    className={`header-button ${drawerClass} ${activeClass}`}
                    key={route.label}
                    onClick={() => handleClick(route)}
                    // size='small'
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
                        <Typography className='header-icon-text'>tk</Typography>
                    </div>
                    {showHeaderNavigation
                        ? (
                            <div className='header-buttons'>
                                {routeButtons(false)}
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
                {routeButtons(true)}
            </Drawer>
        </>
    );
};

export default Header;