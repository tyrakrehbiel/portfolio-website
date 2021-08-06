import {
    Grid, Paper
} from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import fullLogo from '../../media/logo/full-logo.svg';
import Login from './Login';
import Register from './Register';
import './_LoginRegister.scss';




interface Props {
    isLoginAttempt: boolean;
}

const LoginRegisterContainer: React.FC<Props> = (props: Props) => {
    const [showTitle, setShowTitle] = React.useState<boolean>(true);

    setTimeout(() => {
        setShowTitle(false);
    }, 4000);

    const isLoginAttempt = props.isLoginAttempt;

    return (
        <div className= { 'login-register-container root '}>
            <AnimatePresence key='animate-presnence-container'>
                <motion.div
                    initial={{ y: '-500vh'}}
                    animate={{y: 0}}
                    transition={{
                        delay: 1,
                        default: { duration: 1} ,
                        ease: 'easeInOut',
                        y: {
                            type: 'spring',
                            stiffness: 30,
                        },
                    }}
                >
                    <Paper 
                        className='paper'
                        elevation={6}
                        square={false}
                    >
                        {isLoginAttempt? <Login/> : <Register/>}
                    </Paper>
                </motion.div>
                <AnimatePresence key='animate-presnence-logo-box'>
                    { showTitle &&
                        <motion.div className = 'title-logo-box'>
                            <motion.div
                                initial={{opacity: 0, x: 1000}}
                                animate={{ opacity: 1, scale: 1, x: 0}}
                                exit={{opacity: 0}}
                                transition={{
                                    x: {
                                        type: 'spring',
                                        stiffness: 50,
                                    },
                                    default: { duration: 1},
                                }}
                            >
                                <Grid container className='logo-title-grid'>
                                    <img src={fullLogo} height='120rem' />
                                    
                                </Grid>
                            </motion.div>
                        </motion.div>
                    }
                </AnimatePresence>
            </AnimatePresence>
        </div>
    )
};

export default LoginRegisterContainer;