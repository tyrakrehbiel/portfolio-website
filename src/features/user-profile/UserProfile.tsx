import * as React from 'react';

import { useAppSelector } from '../../store/hooks';
import { 
    Typography,
    Grid, 
    Button,
    Link,
    Box,
    Avatar
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import UpdatePassword from './UpdatePassword';

const UserProfile: React.FC = () => {

    const curUser = useAppSelector(store => store.user.user);

    // update password dialog
    const [passOpen, setPassOpen] = React.useState<boolean>(false);
    
    const handlePassOpen = () => {
        setPassOpen(true);
    }

    const handlePassClose = () => {
        setPassOpen(false);
    }

    return (
        <div className='UserProfileContainer'>
            <Box boxShadow={3}>
                <Grid container direction='column' justify='center' alignItems='center'  className='profileGradient'>
                    <Grid item xs={12} style={{paddingTop: '5vh'}}>
                        <Avatar className='avatarStyle'>
                            <AccountCircleIcon className='accountCircleIconStyle'/>
                        </Avatar>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2} direction='column' justify='center' alignItems='center' style={{height: '45vh'}}>
                    <Grid item xs={4}>
                        <Typography className='profileText' style={{marginTop: '35px'}}> Mappa since June 30th, 2020 </Typography>
                        <Typography className='profileText'> {curUser.firstName + ' ' + curUser.lastName}</Typography>
                        <Typography className='profileText'> {curUser.email} </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className='updateProfile'>
                            <Link href="/updateProfile" underline='always'> 
                                Update Account Details
                            </Link>
                        </Typography>
                        <Button 
                            onClick={handlePassOpen}
                            color='primary'
                            style={{fontWeight: 'bold'}}
                        >
                            Change Password
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <UpdatePassword open={passOpen} handleClose={handlePassClose}/>
        </div>
    )
};

export default UserProfile;