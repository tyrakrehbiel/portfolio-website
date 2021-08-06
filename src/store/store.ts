import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './loginSlice'
import userReducer from './userSlice'
import selectedDateReducer from './selectedDaySlice'

export const store = configureStore({
    reducer: {
        login: loginReducer,
        user: userReducer,
        selectedDate: selectedDateReducer,
    },
    devTools: true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch