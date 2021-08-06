import { Entry, EntryPage } from '../@types';
import { handleError } from './utils';
import axiosInstance from './axios-instance';
import axios, { AxiosResponse } from 'axios';

export const getUserEntries = (id: number): Promise<AxiosResponse<Entry[]>> =>
    axiosInstance
        .get<Entry[]>(
            `/api/user/${id}/entries`
        ).catch(handleError);


export const createEntry = (entry: Entry): Promise<AxiosResponse<Entry>> =>
    axiosInstance.post<Entry>(
        '/api/entry/',
        {
            id: entry.id,
            title: entry.title,
            recurrenceId: entry.recurrenceId,
            entryType: entry.entryType,
            startDateTime: entry.startDateTime,
            endDateTime: entry.endDateTime,
            description: entry.description,
            location: entry.location,
            fieldList: entry.fieldList,
            fields: entry.fields,
            tagIds: entry.tagIds,
            imageStoreIds: entry.imageStoreIds,
            primaryTagId: entry.primaryTagId
        }
    ).catch(handleError);

export const updateEntry = (entry: Entry): Promise<AxiosResponse<Entry>> =>
    axiosInstance.put<Entry>(
        '/api/entry/',
        {
            id: entry.id,
            title: entry.title,
            recurrenceId: entry.recurrenceId,
            entryType: entry.entryType,
            startDateTime: entry.startDateTime,
            endDateTime: entry.endDateTime,
            description: entry.description,
            location: entry.location,
            fieldList: entry.fieldList,
            fields: entry.fields,
            tagIds: entry.tagIds,
            imageStoreIds: entry.imageStoreIds,
            primaryTagId: entry.primaryTagId
        }
    ).catch(handleError);

export const deleteEntry = (id: number): Promise<AxiosResponse<number>> =>
    axiosInstance.delete<number>(
        `/api/entry/${id}`
    ).catch(handleError);

export const getEntryPage = (page: number, size: number, sortFld: string): Promise<AxiosResponse<EntryPage>> =>
    axios.get<EntryPage>(
        `http://localhost:8080/api/entry/page?page=${page}&size=${size}&sortFld=${sortFld}`
    );

export const getEntryById = (id: number): Promise<AxiosResponse<Entry>> =>
    axiosInstance
        .get<Entry>(
            `/api/entry/${id}`
        ).catch(handleError);

export const getByBetweenDateTime = (startPeriod:string, endPeriod:string, userId: string): Promise<AxiosResponse<Entry[]>> =>
    axiosInstance
        .get<Entry[]>(
            `/api/entry/betweenDateTime=?endPeriod=${endPeriod}&startPeriod=${startPeriod}&userId=${userId}`
        ).catch(handleError);

export const belongsToMe = (userId: number, entryId: number): Promise<AxiosResponse<boolean>> =>
    axiosInstance
        .get<boolean>(
            `/api/entry/belongsToMe=?userId=${userId}&entryId=${entryId}`
        ).catch(handleError);

