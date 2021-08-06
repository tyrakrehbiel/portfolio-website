import { Entry, ImageStore } from '../@types';
import { handleError } from './utils';
import axiosInstance from './axios-instance';
import { AxiosResponse } from 'axios';

export const getImageById = (id: number): Promise<AxiosResponse<ImageStore>> =>
    axiosInstance
        .get<ImageStore>(
            `/api/imageStore/${id}`
        ).catch(handleError);


export const createImageStore = (imageStore: ImageStore): Promise<AxiosResponse<ImageStore>> =>
    axiosInstance.post<ImageStore>(
        '/api/imageStore/',
        {
            id: imageStore.id,
            filename: imageStore.filename,
            image: imageStore.image,
        }
    ).catch(handleError);

// delete imagestore
export const deleteImageStoreById = (id: number): Promise<AxiosResponse<ImageStore>> =>
    axiosInstance.delete<ImageStore>(
        `/api/imageStore/${id}`
    ).catch(handleError);