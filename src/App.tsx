import React from 'react';
import { CssBaseline } from '@mui/material';

import Home from './features/home/Home';
import { Route, Routes } from 'react-router-dom';
import About from './features/about/About';
import Contact from './features/contact/Contact';
import Portfolio from './features/portfolio/Portfolio';
import Header from './common/header/Header';
import Footer from './common/footer/Footer';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Header />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/portfolio' element={<Portfolio />} />
            </Routes>
            <Footer />
        </>
    );
};

export default App;
