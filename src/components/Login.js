import React, { Component } from 'react';
import firebase from '../Firebase';

class Login extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      user: props.user,
      hasAcct: true,
      formErrors: false,
      formMessage: null,
      lostPass: false,
    };
    this.signIn = this.signIn.bind(this);
    this.resetPass = this.resetPass.bind(this);
    this.sendPass = this.sendPass.bind(this);
  }

  // UPDATE STATE AS USER ENTERS INFO INTO THE FORM
  updateUser = e => {
    const value = e.target.value;
    this.setState({ [`${e.target.name}`]: value });
  };

  // SIGN INTO FIREBASE
  signIn = e => {
    e.preventDefault();

    // Some variables we will need
    const { email, password } = this.state;
    const errorMsgs = {
      'auth/user-not-found':
        "Sorry, but we can't find that user. Please try again.",
      'auth/user-disabled': 'Sorry, but this account has been disabled.',
      'auth/invalid-email': 'Sorry, but that email is invalid.',
      'auth/wrong-password': 'Sorry, but that password is incorrect.',
    };

    // Authenticate or throw error
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        //const errorCode = error.code;
        //const errorMessage = error.message;

        if (error) {
          this.setState({
            formErrors: true,
            formMessage: errorMsgs[error.code],
          });
          //this.form.current.reset();
        }
      });
  };

  // CHANGE STATE TO RESET PASSWORD
  resetPass = e => {
    e.preventDefault();
    this.setState({ lostPass: true, formErrors: false, formMessage: null });
  };

  // SEND A LOST PASSWORD REQUEST
  sendPass = e => {
    e.preventDefault();

    // Some variables we will need
    const { email } = this.state;
    const errorMsgs = {
      'auth/user-not-found': "Sorry, but we can't find that user.",
      'auth/user-disabled': 'Sorry, but this account has been disabled.',
      'auth/invalid-email': 'Sorry, but that email is invalid.',
      'auth/wrong-password': 'Sorry, but that password is incorrect.',
    };

    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        this.setState({
          formMessage:
            'Please check your inbox for directions on resetting your password.',
          lostPass: false,
        });
        //this.form.current.reset();
      })
      .catch(error => {
        if (error) {
          this.setState({
            formErrors: true,
            formMessage: errorMsgs[error.code],
          });
          //this.form.current.reset();
        }
      });
  };

  render() {
    const msgType = this.state.formErrors ? 'error' : 'msg';
    return (
      <form
        action=""
        ref={this.form}
        onSubmit={!this.state.lostPass ? this.signIn : this.sendPass}
      >
        {this.state.formMessage ? (
          <div className={`form-message ${msgType}`}>
            <span>{this.state.formMessage}</span>
          </div>
        ) : null}

        <label htmlFor="email" className="screen-reader-text">
          * Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="* Email"
          onChange={this.updateUser}
          required
        />

        {!this.state.lostPass ? (
          <React.Fragment>
            <label htmlFor="password" className="screen-reader-text">
              * Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="* Password"
              onChange={this.updateUser}
              required
            />
          </React.Fragment>
        ) : null}

        {!this.state.lostPass ? (
          <input type="submit" value="Login" className="btn" />
        ) : (
          <input type="submit" value="Reset My Password" className="btn" />
        )}

        {!this.state.lostPass ? (
          <React.Fragment>
            <br />
            <button className="tertiary" onClick={this.resetPass}>
              Forgot Your Password?
            </button>
          </React.Fragment>
        ) : null}
        {this.state.lostPass ? (
          <React.Fragment>
            <br />
            <button
              className="tertiary"
              onClick={() => this.setState({ lostPass: false })}
            >
              Cancel
            </button>
          </React.Fragment>
        ) : null}
      </form>
    );
  }
}

export default Login;
