import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Typography } from '@material-ui/core';

interface Props {
    open: boolean;
    setShowEditErrorBar: (arg0: boolean) => void;
}

const EditErrorBar: React.FC<Props> = (props: Props) => {

    const {open, setShowEditErrorBar} = props;


    const handleClose = () => {    
        setShowEditErrorBar(false);
    };

    return (
        <Snackbar
            className='EditErrorBar'
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={open}
            onClose={handleClose}
            ContentProps={{
                style: {backgroundColor: '#FF6961'}
            }}
            action={
                <React.Fragment>
                    <Typography style={{fontSize: '1.3em', marginRight: '10px'}}>You do not have permission to edit this entry. </Typography>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </React.Fragment>
            }
        />
    )
}

export default EditErrorBar;