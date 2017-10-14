import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, browserHistory, withRouter } from 'react-router';

import HikeList from './HikeList.jsx';
import HikeEdit from './HikeEdit.jsx';

const contentNode = document.getElementById('contents');
const NoMatch = () => <p>Page Not Found</p>;

const App = (props) => (
  <div>
    <div className="header">
      <h1>Hikes</h1>
    </div>
    <div className="contents">
      {props.children}
    </div>
  </div>
);

App.propTypes = {
  children: React.PropTypes.object.isRequired,
};

const RoutedApp = () => (
  <Router history={browserHistory} >
    <Redirect from="/" to="/hikes" />
    <Route path="/" component={App} >
      <Route path="hikes" component={withRouter(HikeList)} />
      <Route path="hikes/:id" component={HikeEdit} />
      <Route path="*" component={NoMatch} />
    </Route>
  </Router>
);

ReactDOM.render(<RoutedApp />, contentNode);

if (module.hot) {
  module.hot.accept();
}