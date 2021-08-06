import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { 
    Typography,
    Button,
    Box,
    Paper
} from '@material-ui/core'

import MapIcon from '@material-ui/icons/Map';

import './NotFound';

const NotFound: React.FC = () => {
    const history = useHistory();

    //Note: we should be able to check permissions to determine if the button should take them back to login or to home
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        history.push('/year');
    };

    return (
        <div className='main-not-found'>
            <Paper className='paper'>
                <Box className='map-box' >
                    <MapIcon className='map-icon'/>
                </Box>
                <Typography className='title'>
                    Uh Oh... Lost Your Map?
                </Typography>
                <Typography className='subtitle'>
                    The page you&apos;re looking for does not exist
                </Typography>
                <Box className= 'button-box'>
                    <Button 
                        className='button'
                        type = 'submit'
                        variant = 'contained'
                        color = 'primary'
                        size = 'large'
                        onClick={handleSubmit}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Paper>
        </div>
    );
};
export default NotFound;