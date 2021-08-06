import { Attendee } from '../@types';
import { handleError } from './utils';
import axiosInstance from './axios-instance';
import axios, { AxiosResponse } from 'axios';

export const addAttendee = (attendee: Attendee): Promise<AxiosResponse<Attendee>> =>
    axiosInstance.post<Attendee>(
        '/api/attendee/', attendee
    ).catch(handleError);

export const getInvitesByEmail = (email: string): Promise<AxiosResponse<Attendee[]>> => {
    return axiosInstance
        .get<Attendee[]>(`/api/attendee/email=?email=${email}`
        ).catch(handleError);
}

export const updateAttendee = (attendee: Attendee): Promise<AxiosResponse<Attendee>> =>
    axiosInstance.put<Attendee>(
        '/api/attendee/', attendee
    ).catch(handleError);

export const getAttendeesByEntry = (id: number): Promise<AxiosResponse<Attendee[]>> => {
    return axiosInstance
        .get<Attendee[]>(`/api/attendee/entry/${id}`
        ).catch(handleError);
}
