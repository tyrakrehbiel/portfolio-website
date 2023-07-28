import * as React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const downloadResume = () => {
        console.log('downloading resume');
    };

    const routes = [
        {
            label: 'About',
            path: '/about'
        }, {
            label: 'Portfolio',
            path: '/portfolio'
        }, {
            label: 'Resume',
            onClick: downloadResume
        }, {
            label: 'Contact',
            path: '/contact'
        }
    ];

    return (
        <AppBar className='header' elevation={0}>
            <Toolbar variant='dense' className='header-content'>
                <div className='header-icon' onClick={() => navigate('/')}>
                    <Typography className='header-icon-text'>
                        tk
                    </Typography>
                </div>
                <div className='header-buttons'>
                    {routes.map((route) => (
                        <Button
                            className={`header-button ${location.pathname == route.path ? 'active' : ''}`}
                            key={route.label}
                            onClick={route.onClick ?? (() => navigate(route.path))}
                            size='small'
                        >
                            {route.label}
                        </Button>
                    ))}
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Header;