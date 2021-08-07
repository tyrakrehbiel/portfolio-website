import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';
import './index.scss'

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
