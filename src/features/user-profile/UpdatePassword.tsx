import * as React from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogActions,
    Button
} from '@material-ui/core';
import { BForm, BPassword, BSubmit } from 'mui-bueno';
import { Formik, FormikHelpers } from 'formik';

import { postLogin, liteUpdateUser } from '../../axios/user';
import { LoginRequest, User } from '../../@types';
import { AxiosError } from 'axios';
import { useAppSelector } from '../../store/hooks';

interface Props {
    open: boolean;
    handleClose: () => void;
}

const UpdatePassword: React.FC<Props> = (props: Props) => {

    const {open, handleClose} = props;
    const curUser = useAppSelector(store => store.user.user);

    // mui bueno
    const initialValues = {
        oldPassword: '',
        newPassword: ''
    }

    async function checkPassword(email:string, password: string) {
        const req: LoginRequest = {email, password};
        const prom = await postLogin(req);
        return prom;
    }
    
    async function updateUser(password: string) {
        // create a user object with the updates, lists are not used
        const user: User = {
            id: curUser.id,
            firstName: curUser.firstName,
            lastName: curUser.lastName,
            email: curUser.email,
            password,
            tagIds: undefined,
            entryIds: undefined
        }
        // call lite update
        const prom = await liteUpdateUser(user);
        return prom;
    }

    const handleSubmit = (values: typeof initialValues, {setStatus, resetForm} : FormikHelpers<typeof initialValues>) => {
        // check password
        checkPassword(curUser.email, values.oldPassword).then(() => {
            // liteUpdate
            updateUser(values.newPassword).then(() => {
                // successful update, close form
                resetForm();
                handleClose();
            }).catch(() => {
                // update failed
                setStatus({oldPassword: 'Server error!'});
                setStatus({newPassword: 'Server error!'});
            });
        }).catch((loginErr: AxiosError) => {
            // invalid password
            if (loginErr.message.includes('401')) {
                setStatus({oldPassword: 'Incorrect Password'});
            } else {
                // general error msg
                setStatus({oldPassword: 'Server error!'});
            }
        })
        
    }

    return (
        <div className='UpdatePasswordContainer'>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
            >
                <DialogTitle>
                    Change Your Password
                </DialogTitle>
                <DialogContent className='DialogContent'>
                    <Formik
                        className='form'
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        validateOnChange={false}
                    >
                        <BForm>
                            <BPassword name="oldPassword" required w={6}/>
                            <BPassword name="newPassword" required w={6}/>
                            <DialogActions>
                                <BSubmit fullWidth className='SubmitButton' variant='contained'>Submit</BSubmit>
                                <Button fullWidth onClick={handleClose}>Cancel</Button>
                            </DialogActions>
                        </BForm>
                    </Formik>
                </DialogContent>


            </Dialog>

        </div>
    )
}

export default UpdatePassword;