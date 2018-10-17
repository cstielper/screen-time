import React, { Component } from 'react';
import firebase from '../Firebase';

const extraTop = {
  marginTop: '0.75rem',
};

class CreateAcct extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      user: props.user,
      hasAcct: true,
      formErrors: false,
      errorMessage: null,
    };
    this.createAcct = this.createAcct.bind(this);
  }

  // UPDATE STATE AS USER ENTERS INFO INTO THE FORM
  updateUser = e => {
    const value = e.target.value;
    this.setState({ [`${e.target.name}`]: value });
  };

  // CREATE AN ACCOUNT AT FIREBASE
  createAcct = e => {
    e.preventDefault();

    // Some variables we will need
    const {
      email,
      password,
      passwordConfirm,
      displayName,
      childID,
    } = this.state;

    const errorMsgs = {
      'auth/email-already-in-use': 'Sorry, but that email has been taken.',
      'auth/operation-not-allowed':
        'Sorry, but this account has been disabled.',
      'auth/invalid-email': 'Sorry, but that email is invalid.',
      'auth/weak-password': 'Sorry, but you need to use a stronger password.',
    };

    if (password === passwordConfirm) {
      if (!childID) {
        // Create child auth account
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          // Then, create a user in the Firebase DB with their auth id as the node
          .then(user => {
            const usersRef = firebase.database().ref('users');
            const userDetails = {
              name: displayName,
              email: user.user.email,
              level: 'child',
              hasAccess: false,
              parentID: false,
              timeRemaining: 3600,
            };
            usersRef.child(user.user.uid).set(userDetails);
          })
          .catch(error => {
            if (error) {
              this.setState({
                formErrors: true,
                errorMessage: errorMsgs[error.code],
              });
              this.form.current.reset();
            }
          });
      } else {
        // Create parent auth account
        const usersRef = firebase.database().ref(`users`);
        usersRef.once('value', snapshot => {
          if (snapshot.hasChild(childID)) {
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              // Then, create a user in the Firebase DB with their auth id as the node
              .then(user => {
                const userDetails = {
                  name: displayName,
                  email: user.user.email,
                  level: 'parent',
                };
                usersRef.child(user.user.uid).set(userDetails);

                // Grant the child account access to use the app and create an entry under the parent "mapping" them to the child
                firebase
                  .database()
                  .ref(`users/${childID}`)
                  .update({ hasAccess: true, parentID: user.user.uid });

                firebase
                  .database()
                  .ref(`users/${user.user.uid}/children`)
                  .push({ id: childID });
              });
          } else {
            this.setState({
              formErrors: true,
              errorMessage:
                "Sorry, but we can't seem to find that child. Please make sure you have entered the ID correctly.",
            });
          }
        });
      }
    } else {
      this.setState({
        formErrors: true,
        errorMessage: 'Please make sure that your passwords match.',
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <form action="" ref={this.form} onSubmit={this.createAcct}>
          {this.state.formErrors ? (
            <div className="form-message error">
              <span>{this.state.errorMessage}</span>
            </div>
          ) : null}

          <label htmlFor="displayName" className="screen-reader-text">
            * Name
          </label>
          <input
            type="text"
            name="displayName"
            placeholder="* Your Name"
            onChange={this.updateUser}
            required
          />

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

          <label htmlFor="passwordConfirm" className="screen-reader-text">
            * Confirm Password
          </label>
          <input
            type="password"
            name="passwordConfirm"
            placeholder="* Confirm Password"
            onChange={this.updateUser}
            required
          />

          <label htmlFor="childID" style={extraTop}>
            To create a parent account, please enter a valid Child ID below:
          </label>
          <input
            type="text"
            name="childID"
            placeholder="Child ID"
            onChange={this.updateUser}
          />

          <input type="submit" value="Create Account" className="btn" />
          <br />
          <button className="tertiary" onClick={this.props.cancelCreateAcct}>
            Cancel
          </button>
        </form>
      </React.Fragment>
    );
  }
}

export default CreateAcct;
