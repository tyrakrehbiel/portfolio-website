import { SelectedDate } from '../@types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

const getToday = () => {
    const today = new Date();
    return today.toISOString();
}

export const initialState: SelectedDate = {
    date: getToday()
};

export const selectedDateSlice = createSlice({
    initialState: initialState,
    name: 'SelectedDate',
    reducers: {
        setDate: (state, action: PayloadAction<SelectedDate>) => {
            return {
                ...state,
                date: action.payload.date
            };
        },
        // Removed state, didn't do anything
        clearDate: () => {
            return {
                ...initialState
            };
        }
    }
})

export const { setDate, clearDate } = selectedDateSlice.actions

export default selectedDateSlice.reducer