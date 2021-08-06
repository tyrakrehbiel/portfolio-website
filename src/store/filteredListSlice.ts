import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Tag } from '../@types';

export interface FilteredList {
    types: string[];
    tagList: Tag[];
}
export const initialState: FilteredList = {
    types: [],
    tagList: []
};

export const filteredListSlice = createSlice({
    initialState: initialState,
    name: 'filtered',
    reducers: {
        setFilteredTags: (state, action: PayloadAction<Tag[]>) => {
            return {
                ...state,
                tagList: action.payload
            };
        },
        setFilteredTypes: (state, action: PayloadAction<string[]>) => {
            return {
                ...state,
                types: action.payload
            };
        },
    }
})

export const { setFilteredTags, setFilteredTypes } = filteredListSlice.actions

export default filteredListSlice.reducer