import React from 'react';
import { CssBaseline } from '@mui/material';

import Home from './features/home/Home';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Home />
        </>
    );
};

export default App;
