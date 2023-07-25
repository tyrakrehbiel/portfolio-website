import React from 'react';
import { CssBaseline } from '@mui/material';
import './index.scss';

import TempPage from './features/temp-page/TempPage';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <TempPage />
        </>
    );
};

export default App;
