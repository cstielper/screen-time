import React, { Component } from 'react';
import CreateAcct from './CreateAcct';
import Login from './Login';

class Authenticate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      hasAcct: true,
    };
    this.cancelCreateAcct = this.cancelCreateAcct.bind(this);
  }

  cancelCreateAcct = () => {
    this.setState({ hasAcct: true });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.hasAcct ? (
          <React.Fragment>
            <Login user={this.state.user} />
            <button
              className="secondary"
              onClick={() => this.setState({ hasAcct: false })}
            >
              New Here? Create an Account
            </button>
          </React.Fragment>
        ) : (
          <CreateAcct
            user={this.state.user}
            cancelCreateAcct={this.cancelCreateAcct}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Authenticate;
