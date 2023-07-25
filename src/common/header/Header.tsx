import * as React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';

const Header: React.FC = () => {    
    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h2">
                        Tyra Krehbiel
                    </Typography>
                    <Button color="inherit">
                        About
                    </Button>
                    <Button>
                        Projects
                    </Button>
                    <Button>
                        Art
                    </Button>
                    <Button>
                        Contact
                    </Button>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Header;