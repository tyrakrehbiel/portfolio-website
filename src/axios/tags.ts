import { AxiosResponse } from 'axios';
import { Tag } from '../@types';
import { handleError } from './utils';
import axiosInstance from './axios-instance';

export const createTag = (tag: Tag): Promise<AxiosResponse<Tag>> =>
    axiosInstance.post<Tag>(
        'api/tag/',
        {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            fieldList: tag.fieldList,
            archived: tag.archived
        }
    ).catch(handleError);

export const updateTag = (tag: Tag): Promise<AxiosResponse<Tag>> =>
    axiosInstance.put<Tag>(
        'api/tag/',
        {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            fieldList: tag.fieldList,
            archived: tag.archived
        }
    ).catch(handleError);

export const deleteTag = (id: number): Promise<AxiosResponse<number>> =>
    axiosInstance.delete<number>(
        `/api/tag/${id}`
    ).catch(handleError);

export const getUserTags = (id: number): Promise<AxiosResponse<Tag[]>> =>
    axiosInstance
        .get<Tag[]>(
            `/api/user/${id}/tags`
        ).catch(handleError);

export const getTagById = (id: number): Promise<AxiosResponse<Tag>> =>
    axiosInstance
        .get<Tag>(
            `/api/tag/${id}`
        ).catch(handleError);