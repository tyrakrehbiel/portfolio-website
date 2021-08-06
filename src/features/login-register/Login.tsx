import {
    Box, Button, Checkbox,
    FormControlLabel, Grid, Link, TextField, Typography
} from '@material-ui/core';
import { AxiosError } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { LoginRequest } from '../../@types';
import axiosInstance from '../../axios/axios-instance';
import { getUserByEmail, postLogin } from '../../axios/user';
import smallLogo from '../../media/logo/small-logo.svg';
import { useAppDispatch } from '../../store/hooks';
import { setToken } from '../../store/loginSlice';
import { saveUser } from '../../store/userSlice';
import './_LoginRegister.scss';




// validate login info provided
const schema = yup.object().shape({
    email: yup.string().email('Must be in email format').required('Email is required'),
    password: yup.string().required('Password is required')
});


const Login: React.FC = () => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [credentials, setCredentials] = React.useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = React.useState<LoginRequest>({
        email: '',
        password: ''
    });

    const handleLogin = (creds: LoginRequest) => {
        postLogin(creds).then(res => {
            // success
            // add token to axios and storage
            axiosInstance.defaults.headers.common.Authorization =
                'Bearer ' + res.data.token;
            localStorage.setItem('token', res.data.token);
            dispatch(setToken(res.data));

            // add currentUser to redux
            getUserByEmail(creds.email).then(res => {
                dispatch(saveUser(res.data));
                // go to calendar
                history.push('/year');
            });
        }).catch((err: AxiosError) => {
            // login failed, display errors
            const list: LoginRequest = { email: '', password: '' };
            // create error, email is taken
            if (err.message.includes('401')) {
                list['email'] = 'Invalid email or password';
                list['password'] = 'Invalid email or password';
            } else {
                // general error msg
                list['email'] = 'Server error!';
                list['password'] = 'Server error!';
            }
            setErrors(list);
        });
    }

    const handleSubmit = (event: React.FormEvent) => {

        event.preventDefault();
        // validate email/pass
        schema.validate(credentials, { abortEarly: false })
            .then(() => {
                // clear errors and log in
                setErrors({ email: '', password: '' });
                handleLogin(credentials);
                // validation failed
            }).catch((err: yup.ValidationError) => {
                const list: any = {};
                for (const e of err.inner) {
                    if (e.path != undefined)
                        list[e.path] = e.message;
                }
                // display errors
                setErrors(list);
            });
    };

    const handleChange = (name: keyof LoginRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [name]: event.target.value });
    }

    return (
        <div className='login-register-form paper-content'>
            <Grid container className='logo-title-grid'>
                <img src={smallLogo} height={70} />
                <Typography className='title'> Login </Typography>
            </Grid>
            <Typography className='subtitle'> And Map your life </Typography>
            <form className='form' onSubmit={handleSubmit}>
                <TextField
                    label='Email'
                    fullWidth
                    // required
                    margin='dense'
                    variant='outlined'
                    onChange={handleChange('email')}
                    error={!!errors['email']}
                    helperText={errors['email']}
                />
                <TextField
                    label='Password'
                    type='password'
                    // required
                    fullWidth
                    margin='dense'
                    variant='outlined'
                    onChange={handleChange('password')}
                    error={!!errors['password']}
                    helperText={errors['password']}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={false}
                            name="rememberCheck"
                            color="primary"
                        />
                    }
                    label="Remember Me"
                />
                <Box className='button-container'>
                    <Button
                        className='button'
                        type='submit'
                        variant='contained'
                        color='primary'
                    >
                        LOGIN
                    </Button>
                </Box>
            </form>

            <Box className='footer create-account'>
                <Typography className='body1'>
                    Don&apos;t have an account?
                </Typography>
                <Typography className='body1'>
                    <Link className='link' href="/register">
                        Create Account
                    </Link>
                </Typography>
            </Box>

        </div>
    )
};

export default Login;