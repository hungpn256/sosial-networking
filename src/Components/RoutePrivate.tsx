import React from 'react';
import { Redirect, Route } from 'react-router-dom';

interface IRoute {
  path: string;
  name: string;
  component: any;
  authority?: Array<string>;
  rest: {
    routes?: string;
  };
}
const RoutePrivate = ({ component: Component, authority, ...rest }: IRoute, login) => {
  const { user } = login;
  return (
    <Route
      {...rest}
      key={rest?.path}
      render={(props: any) => {
        if (
          authority === undefined ||
          (authority &&
            authority?.some((item: string) => {
              return item === user?.role;
            }))
        ) {
          return <Component {...props} routes={rest?.routes}></Component>;
        } else {
          return (
            <Redirect
              to={{ pathname: '/auth/login', state: { prePath: props.location.pathname } }}
            ></Redirect>
          );
        }
      }}
    ></Route>
  );
};

export default RoutePrivate;
