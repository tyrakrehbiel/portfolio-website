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
        <AppBar>
            <Toolbar variant='dense'>
                <Typography variant='h5' className='header-title'>
                    Tyra Krehbiel
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Header;