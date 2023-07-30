import React from 'react';
import { CssBaseline } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/home/Home';
import About from './pages/about/About';
import Contact from './pages/contact/Contact';
import Portfolio from './pages/portfolio/Portfolio';
import Layout from './components/layout/Layout';
import NotFound from './pages/not-found/NotFound';

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
