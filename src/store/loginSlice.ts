import { LoginResponse } from '../@types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export const initialState: LoginResponse = {
    token: ''
};

export const loginSlice = createSlice({
    initialState: initialState,
    name: 'login',
    reducers: {
        setToken: (state, action: PayloadAction<LoginResponse>) => {
            return {
                ...state,
                token: action.payload.token
            };
        },
        clearToken: () => {
            return {
                ...initialState
            };
        }
    }
})

export const { setToken, clearToken } = loginSlice.actions

export default loginSlice.reducer