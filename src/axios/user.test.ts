import MockAdapter from 'axios-mock-adapter';
import axiosInstance from './axios-instance';

const mockAxios = new MockAdapter(axiosInstance);


describe('Example functionality', () => {
    it('passes unconditionally', () => {
        expect(true).toBe(true);
    })
});


