import jwt_decode from 'jwt-decode';
import * as React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { DecodedToken, User } from '../../@types';
import axiosInstance from '../../axios/axios-instance';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearToken, setToken } from '../../store/loginSlice';
import { saveUser } from '../../store/userSlice';


interface OwnProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<OwnProps> = props => {
    const { component, ...rest } = props;
  
    const dispatch = useAppDispatch();
    
    const reduxJwt = useAppSelector(store => store.login.token);
    const localJwt = localStorage.getItem('token');

    const token = reduxJwt ? reduxJwt : (localJwt ? localJwt : '');
    const decodedToken = token && jwt_decode(token) as DecodedToken;
    let validToken = false;

  
    if (decodedToken) {
        if (decodedToken.exp > (Math.floor(new Date().getTime() / 1000))) {
            // handle token storage
            dispatch(setToken({token}));
            localStorage.setItem('token', token);
            axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
            validToken = true;

            // add user to redux store
            // faster than backend call, and doesn't store unneeded data
            
            const halfUser: User = {
                id: decodedToken.id,
                email: decodedToken.email,
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                password: undefined,
                tagIds: undefined,
                entryIds: undefined
            }
            dispatch(saveUser(halfUser));

            
        } else {
            localStorage.removeItem('token');
            axiosInstance.defaults.headers.common.Authorization = '';
            dispatch(clearToken());
        }
    }
  
    const Component = component;
  
    const renderFn = (routerProps: any) => {
        return validToken ? (
            <Component {...routerProps} />
        ) : (
            <Redirect
                to={{
                    pathname: '/login',
                    state: { from: props.location }
                }}
            />
        );
    };
  
    return <Route {...rest} render={renderFn} />;
};
  
export default ProtectedRoute;
  