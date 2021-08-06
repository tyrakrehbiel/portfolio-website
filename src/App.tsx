import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';
import './index.scss'

import Header from './common/header/Header';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Header />
        </>
    );
};

export default App;
