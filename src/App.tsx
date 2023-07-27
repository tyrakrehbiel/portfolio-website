import React from 'react';
import { CssBaseline } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import Home from './features/home/Home';
import About from './features/about/About';
import Contact from './features/contact/Contact';
import Portfolio from './features/portfolio/Portfolio';
import Layout from './common/layout/Layout';
import NotFound from './features/not-found/NotFound';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Layout>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/portfolio' element={<Portfolio />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </Layout>
        </>
    );
};

export default App;
