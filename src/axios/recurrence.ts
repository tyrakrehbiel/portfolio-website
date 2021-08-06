import { Recurrence } from '../@types';
import { handleError } from './utils';
import axiosInstance from './axios-instance';
import { AxiosResponse } from 'axios';

export const createRecurrence = (recur: Recurrence): Promise<AxiosResponse<Recurrence>> =>
    axiosInstance.post<Recurrence>(
        '/api/recurrence/', recur
    ).catch(handleError);

export const updateRecurrence = (recur: Recurrence) => 
    axiosInstance.put<Recurrence>(
        '/api/recurrence/', recur
    ).catch(handleError);

export const getRecurrenceById = (id: number) =>
    axiosInstance.get<Recurrence>(
        `/api/recurrence/${id}`
    ).catch(handleError);

export const getRecurrenceByEntryId = (id: number) =>
    axiosInstance.get<Recurrence>(
        `/api/recurrence/entry/${id}`
    ).catch(handleError);

export const deleteRecurrence = (id: number) =>
    axiosInstance.delete<Recurrence>(
        `/api/recurrence/${id}`
    ).catch(handleError);