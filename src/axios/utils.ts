import { AxiosError } from 'axios';

// type of never added for warning
export const handleError = (error: AxiosError): never => {
    throw error
};
