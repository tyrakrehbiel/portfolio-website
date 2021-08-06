import { DecodedToken, User } from '../@types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

export interface UserState {
    user: User;
  }

const getUserData = (): User => {
    const localJwt = localStorage.getItem('token');

    const token = (localJwt ? localJwt : '');
    if (token ==='' ) {
        return {
            id: undefined,
            email: '',
            firstName: '',
            lastName: '',
            password: undefined,
            tagIds: undefined,
            entryIds: undefined
        } 
    }
    const decodedToken: DecodedToken = jwt_decode(token);

    return {
        id: decodedToken.id,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        password: undefined,
        tagIds: undefined,
        entryIds: undefined
    }
}

export const initialState: UserState = {
    user: {
        email: getUserData().email,
        firstName: getUserData().firstName,
        lastName: getUserData().lastName,
        id: getUserData().id,
        password: undefined,
        entryIds: undefined,
        tagIds: undefined
    }
};

export const userSlice = createSlice({
    initialState: initialState,
    name: 'user',
    reducers: {
        saveUser: (state, action: PayloadAction<User>) => {
            return {
                ...state,
                user: action.payload
            };
        },
        // Removed state, didn't do anything
        clearUser: () => {
            return {
                ...initialState
            };
        }
    }
})

export const { saveUser, clearUser } = userSlice.actions

export default userSlice.reducer;
