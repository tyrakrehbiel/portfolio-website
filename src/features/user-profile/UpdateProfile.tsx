import * as React from 'react';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import { AxiosError } from 'axios';
import { BForm, BTextField, BEmail, BPassword, BSubmit } from 'mui-bueno';
import { Formik, FormikHelpers } from 'formik';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { LoginRequest, User } from '../../@types';
import { postLogin, liteUpdateUser } from '../../axios/user';
import axiosInstance from '../../axios/axios-instance';
import { setToken, clearToken } from '../../store/loginSlice';
import { Button, 
    Grid, 
    Paper, 
    Typography } from '@material-ui/core';
import { saveUser } from '../../store/userSlice';

export interface UpdateForm {
    firstName: string
    lastName: string
    email: string,
    password: string
}

// validate user info provided
const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Must be in email format').required('Email is required'),
    password: yup.string().required('Password is required to update user info')
});

const UpdateProfile: React.FC = () => {

    const history = useHistory();
    const dispatch = useAppDispatch();

    const curUser = useAppSelector(store => store.user.user);

    // mui bueno
    const initialValues = {
        firstName: curUser.firstName,
        lastName: curUser.lastName,
        email: curUser.email,
        password: ''
    }

    async function checkPassword(email:string, password: string) {
        const req: LoginRequest = {email, password};
        const prom = await postLogin(req);
        return prom;
    }

    async function updateUser(values: typeof initialValues) {
        // create a user object with the updates, lists are not used
        const user: User = {
            id: curUser.id,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            tagIds: undefined,
            entryIds: undefined
        }
        // call lite update
        const prom = await liteUpdateUser(user);
        return prom;
    }

    // after making a change, the frontend will need a new token with the correct info
    const handleRelog = (email: string, password: string, setStatus : (status?: any) => void, newUser: User) => {
        const creds: LoginRequest = {
            email,
            password
        };
        
        postLogin(creds).then(res => {
            // success
            // add token to axios and storage
            dispatch(clearToken());
            localStorage.clear();
            axiosInstance.defaults.headers.common.Authorization =
            'Bearer ' + res.data.token;
            localStorage.setItem('token', res.data.token);
            dispatch(setToken(res.data));
            dispatch(saveUser(newUser));
            history.push('/profile');
        }).catch(() => {
            // this should not fail
            setStatus({password: 'Server error!'})
        });
    }

    const handleSubmit = (values: typeof initialValues, {setStatus} : FormikHelpers<typeof initialValues>) => {
        //values.preventDefault();
        // validate user data
        schema.validate(values, {abortEarly: false})
            .then(() => {
                // check password
                checkPassword(curUser.email, values.password).then(() => {
                    /// send update to backend
                    updateUser(values).then((updateResp) => {
                        // relog to get new token with updated info
                        handleRelog(values.email, values.password, setStatus, updateResp.data);

                    }).catch((err: AxiosError) => {
                        // failed to update user, display errors
                        // create error, email is taken
                        if (err.message.includes('422')) {
                            setStatus({email: 'This email is already registered'});
                        } else {
                            // general error msg
                            setStatus({email: 'Server error!'});
                        }
                    });
                    
                }).catch((loginErr: AxiosError)=>{
                    // invalid password
                    if (loginErr.message.includes('401')) {
                        setStatus({password: 'Incorrect Password'});
                    } else {
                        // general error msg
                        setStatus({email: 'Server error!'});
                    }
                });
            }).catch( (err: yup.ValidationError) => {
                // failed to validate form
                for (const e of err.inner) {
                    if (e.path)
                        console.log(e.path)
                }
            });
    }

    return (
        <div className='UpdateProfileContainer'>
            
            {/* mui bueno*/}
            <Formik
                className = 'form'
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
            >
                <Grid container direction='column' justify='center' alignItems='center' className='gridGradient'>
                    <Grid item xs={12} className='FieldGridItem'>
                        <Paper 
                            className='paper'
                            elevation={6}
                            square={false}
                        >
                            <Typography className='FormTitle'> Update Profile Info</Typography>
                            <BForm>
                                <BTextField name="firstName" required sm={6} />
                                <BTextField name="lastName" required sm={6}/>
                                <BEmail name="email" sm={6} />
                                <Typography className='PassText'> Password is required to update info </Typography>
                                <BPassword name="password" required w={6}/>
                                <BSubmit variant='contained'>Submit</BSubmit>
                                <Button href='/profile'> Cancel</Button>
                            </BForm>
                        </Paper>
                    </Grid>
                </Grid>
            </Formik>
        </div>
    )
}


export default UpdateProfile;
