import axiosInstance from './axios-instance';
import { User, LoginRequest, LoginResponse, Tag, Entry } from '../@types';
import { handleError } from './utils';
import { AxiosResponse } from 'axios';

// get user by id
export const getUser = (id: number): Promise<AxiosResponse<User>> =>
    axiosInstance.get<User>(
        `/api/user/${id}`
    ).catch(handleError);

// get user by email
export const getUserByEmail = (email: string): Promise<AxiosResponse<User>> =>
    axiosInstance.get<User>(
        `/api/user/email?email=${email}`
    ).catch(handleError);

// update user
export const putUser = (user: User): Promise<AxiosResponse<User>> =>
    axiosInstance.put<User>(
        '/api/user/', user
    ).catch(handleError);

// update user
export const liteUpdateUser = (user: User): Promise<AxiosResponse<User>> =>
    axiosInstance.put<User>(
        '/api/user/liteUpdate', user
    ).catch(handleError);

// create user
export const postUser = (user: User): Promise<AxiosResponse<User>> =>
    axiosInstance.post<User>(
        '/api/register/', user
    ).catch(handleError);

// log in
export const postLogin = (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    axiosInstance.post<LoginResponse>(
        '/api/login', credentials
    ).catch(handleError);

// delete user
export const deleteUser = (id: number): Promise<AxiosResponse<User>> =>
    axiosInstance.delete<User>(
        `/api/user/${id}`
    ).catch(handleError);

// add tag to user
export const addUserTag = (userId: number, tagId: number): Promise<AxiosResponse<Tag>> =>
    axiosInstance.put<Tag>(
        `/api/user/addtag?tagId=${tagId}&userId=${userId}`
    ).catch(handleError);

// get tag list
export const getUserTags = (id: number): Promise<AxiosResponse<Tag[]>> =>
    axiosInstance.get<Tag[]>(
        `/api/user/${id}/tags`,
    ).catch(handleError);

// get entry list
export const getUserEntries = (id: number): Promise<AxiosResponse<Entry[]>> =>
    axiosInstance.get<Entry[]>(
        `/api/user/${id}/entries`,
    ).catch(handleError);

export const addUserEntry = (userId: number, entryId: number): Promise<AxiosResponse<Entry>> =>
    axiosInstance.put<Entry>(
        `/api/user/addentry?entryId=${entryId}&userId=${userId}`
    ).catch(handleError);

// do we need a deleteUserEntry?

// get filtered entry list