import React, { useContext } from 'react';
import { PropTypes } from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { ThemeContext } from './ThemeWrapper';
import Dashboard from '../Templates/Dashboard';
import {
  LaunchDashboard, ComingSoon, NotFound, Presale, CreateSale
} from '../pageListAsync';

function Application(props) {
  const { history } = props;
  const changeMode = useContext(ThemeContext);
  return (
    <Dashboard history={history} changeMode={changeMode}>
      <Switch>
        { /* Home */ }
        <Route exact path="/" component={LaunchDashboard} />
        <Route exact path="/app" component={LaunchDashboard} />
        <Route path="/app/launch-dashboard" component={LaunchDashboard} />
        { /* Pages */ }
        <Route path="/app/pages/presale" component={Presale} />
        <Route path="/app/pages/createsale" component={CreateSale} />
        <Route path="/app/pages/coming-soon" component={ComingSoon} />
        { /* Default */ }
        <Route component={NotFound} />
      </Switch>
    </Dashboard>
  );
}

Application.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Application;
