import {
    Box, Button, Grid, Link, TextField, Typography
} from '@material-ui/core';
import { AxiosError } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { User } from '../../@types';
import { postUser } from '../../axios/user';
import smallLogo from '../../media/logo/small-logo.svg';
import './_LoginRegister.scss';




// validate account info in the form
const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Must be in email format').required('Email is required'),
    password: yup.string().required('Password is required')
});

export interface regFormInfo {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}


const Register: React.FC = () => {

    const history = useHistory();

    const [userInfo, setUserInfo] = React.useState<regFormInfo>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = React.useState<regFormInfo>({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // validate info
        schema.validate(userInfo, {abortEarly: false})
            .then(() => {
                setErrors({firstName: '', lastName: '', 
                    email: '', password: ''});
                
                // create account
                const newUser: User = {
                    id: undefined,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email,
                    password: userInfo.password,
                    tagIds: undefined,
                    entryIds: undefined
                } // send user data
                postUser(newUser).then(() => {
                    // go to login
                    history.push('/login');
                }).catch((err: AxiosError) => {
                    // failed to create user, display errors
                    const list: any = {};
                    // create error, email is taken
                    if (err.message.includes('422')) {
                        list['email'] = 'This email is already registered';
                    } else {
                        // general error msg
                        list['email'] = 'Server error!';
                    }
                    setErrors(list);
                });
            // validation failed
            }).catch( (err: yup.ValidationError) => {
                const list: any = {};
                for (const e of err.inner) {
                    if (e.path != undefined)
                        list[e.path] = e.message;
                }
                // display errors
                setErrors(list);
            });
    }

    const handleChange = (name: keyof regFormInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({ ...userInfo, [name]: event.target.value });
    }

    return (
        <div className='login-register-form paper-content'>
            <Grid container className='logo-title-grid'>
                <img src={smallLogo} height={70}/>
                <Typography className='title'> Register </Typography>
            </Grid>
            <Typography className='subtitle'> And Map your life </Typography>
            <form className = 'form' onSubmit={handleSubmit}>
                <TextField
                    label = 'First Name'
                    // required
                    fullWidth
                    margin = 'dense'
                    variant = 'outlined'
                    onChange={handleChange('firstName')}
                    error={!!errors['firstName']}
                    helperText={errors['firstName']}
                />
                <TextField
                    label = 'Last Name'
                    // required
                    fullWidth
                    margin = 'dense'
                    variant = 'outlined'
                    onChange={handleChange('lastName')}
                    error={!!errors['lastName']}
                    helperText={errors['lastName']}
                />
                <TextField
                    label = 'Email'
                    // required
                    fullWidth
                    margin = 'dense'
                    variant = 'outlined'
                    onChange={handleChange('email')}
                    error={!!errors['email']}
                    helperText={errors['email']}
                />
                <TextField
                    label = 'Password'
                    type = 'password'
                    // required
                    fullWidth
                    margin = 'dense'
                    variant = 'outlined'
                    onChange={handleChange('password')}
                    error={!!errors['password']}
                    helperText={errors['password']}
                />
                <Box className='button-container'>
                    <Button
                        className = 'button'
                        type = 'submit'
                        variant = 'contained'
                        color = 'primary'
                    >
                        REGISTER
                    </Button>
                </Box>
                <Box className='footer cancel'>
                    <Typography className='body1'>
                        <Link href="/login">
                            Cancel
                        </Link>
                    </Typography>
                </Box>
            </form>
        </div>
    )
};

export default Register;