import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
// import Layout from './layout';
import Profile from './profile';
import HostApp from './hostapp';
import GuestApp from './guestapp';
import CreateEvent from './createevent';
import Home from './home';
const HOST = require('../app.config').HOST;
const testData = require('../server/model/database')

class App extends React.Component {
  constructor(props) {
    super(props);
    const ourStuff = testData.queue["5817dafb1da5550f5405937f"];
    this.state = {
      event: testData.event,
      history: ourStuff,
      songs: ourStuff,
      guests: testData.guestList["5817dafb1da5550f5405937f"],
    };
    this.newState = this.newState.bind(this);
  }
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Home}>
          {/* make them childen of `App` */}
          <Route path="profile" component={Profile} newState={this.newState}/>
          <Route path="host/:eventId" state={this.state} component={HostApp}/>
          <Route path="guest/:eventId" state={this.state} getData={this.getData} component={GuestApp}/>
          <Route path="createevent" component={CreateEvent} state={this.state} newState={this.newState} />
        </Route>
      </Router>)
    }
    getData() {
      $.get(HOST + "/queue").done((data) => {
        this.setState({songs: data});
      });
    }
    newState(newStateObj) {
      this.setState(newStateObj);
    }
}
export default App;
