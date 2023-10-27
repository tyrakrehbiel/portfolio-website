import * as React from 'react';

import Header from './navigation/Navigation';
import Footer from './footer/Footer';

/**
 * Wrapper to style page layout including header, content, and footer
 * @param props 
 * @returns 
 */
const Layout: React.FC<React.PropsWithChildren> = (props) => {

    return (
        <>
            <Header />
            <div className='page-content'>
                {props.children}
            </div>
            <Footer />
        </>
    );
};

export default Layout;