import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Outer from '../Templates/Outer';
import {
  ComingSoon,
  Maintenance,
  NotFound,
} from '../pageListAsync';

function Auth() {
  return (
    <Outer>
      <Switch>
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/coming-soon" component={ComingSoon} />
        <Route component={NotFound} />
      </Switch>
    </Outer>
  );
}

export default Auth;
