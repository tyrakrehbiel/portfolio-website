import * as React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {

    const navigate = useNavigate();

    const downloadResume = () => {
        console.log('downloading resume');
    };

    const routes = [
        {
            label: 'About',
            onClick: () => navigate('/about')
        }, {
            label: 'Portfolio',
            onClick: () => navigate('/portfolio')
        }, {
            label: 'Resume',
            onClick: downloadResume
        }, {
            label: 'Contact',
            onClick: () => navigate('/contact')
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
                            key={route.label}
                            onClick={route.onClick}
                            style={{ color: 'white' }}
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