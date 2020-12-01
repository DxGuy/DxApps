/* eslint-disable */

import React from 'react';
import Loading from 'dan-components/Loading';
import loadable from '../utils/loadable';

// Landing Page
export const HomePage = loadable(() =>
  import ('./LandingPage/HomePage'), {
    fallback: <Loading />,
  });

//Dashboard
export const LaunchDashboard = loadable(() =>
  import ('./Dashboard/LaunchDashboard'), {
    fallback: <Loading />,
  });

// Layouts
export const AppLayout = loadable(() =>
  import ('./Layouts/AppLayout'), {
    fallback: <Loading />,
  });

// Pages
export const ComingSoon = loadable(() =>
  import ('./Pages/ComingSoon'), {
    fallback: <Loading />,
  });
export const BlankPage = loadable(() =>
  import ('./Pages/BlankPage'), {
    fallback: <Loading />,
  });
export const Presale = loadable(() =>
  import ('./Pages/Presale'), {
    fallback: <Loading />,
  });
export const CreateSale = loadable(() =>
  import ('./Pages/CreateSale'), {
    fallback: <Loading />,
  });

// Other
export const NotFound = loadable(() =>
  import ('./NotFound/NotFound'), {
    fallback: <Loading />,
  });
export const NotFoundDedicated = loadable(() =>
  import ('./Pages/Standalone/NotFoundDedicated'), {
    fallback: <Loading />,
  });
export const Error = loadable(() =>
  import ('./Pages/Error'), {
    fallback: <Loading />,
  });
export const Maintenance = loadable(() =>
  import ('./Pages/Maintenance'), {
    fallback: <Loading />,
  });