import React, { Component } from 'react';
import tv from './svgs/tv.svg';
import firebase from './Firebase';
import Authenticate from './components/Authenticate';
import Header from './components/Header';
import ChildAcct from './components/children/ChildAcct';
import ParentAcct from './components/parents/ParentAcct';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      userDetails: null,
    };
    this.logOut = this.logOut.bind(this);
    this.deleteAcctModal = this.deleteAcctModal.bind(this);
    this.deleteAcct = this.deleteAcct.bind(this);
  }

  // AUTHENTICATE WITH FIREBASE AND SET STATE
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
        const uid = this.state.user.uid;
        const usersRef = firebase.database().ref(`users/${uid}`);
        usersRef.on('value', snapshot => {
          const data = snapshot.val();
          this.setState({ userDetails: data });
        });
      }
    });
  }

  // IF THE USER HAS REQUESTED TO DELETE THEIR ACCT AND THEY HAVE BEEN REMOVED FROM THE DB, DELETE THEIR AUTH ACCT AND DISPLAY A MESSAGE
  componentDidUpdate() {
    if (this.state.removeFromDB && this.state.user) {
      firebase
        .auth()
        .currentUser.delete()
        .then(() =>
          this.setState({
            user: null,
            removeFromDB: false,
            acctDeleteMsg: 'Your account has been removed.',
          })
        )
        .catch(err => console.error(err));
    }
  }

  // UPDATE STATE AS USER ENTERS INFO INTO THE FORM
  updateUser = e => {
    const value = e.target.value;
    this.setState({ [`${e.target.name}`]: value });
  };

  // LOGOUT OF FIREBASE
  // This gets passed to the Header component as a prop
  logOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        this.setState({ user: null, userDetails: null });
      })
      .catch(function(error) {
        // An error happened.
        console.error(error);
      });
  };

  // ACTIVATE/DE-ACTIVATE DELETE ACCT MODAL WINDOW
  // This gets passed to the Header component as a prop
  deleteAcctModal = () => {
    this.setState({ deleteAcctModal: true });
  };

  // DELETE ACCT AT FIREBASE
  deleteAcct = e => {
    e.preventDefault();
    // Reauth the acct in case they haven't logged in for a while.
    // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      this.state.password
    );
    firebase
      .auth()
      .currentUser.reauthenticateAndRetrieveDataWithCredential(credential)
      .then(() => {
        if (this.state.userDetails.level === 'child') {
          const parentID = this.state.userDetails.parentID;
          const childID = this.state.user.uid;

          // If the child is assigned to a parent, remove the child from the parent acct
          if (parentID) {
            const childRef = firebase
              .database()
              .ref(`users/${parentID}/children`)
              .orderByChild('id')
              .equalTo(childID);

            childRef.on('value', snapshot => {
              const data = snapshot.val();
              if (data) {
                firebase
                  .database()
                  .ref(`users/${parentID}/children/${Object.keys(data)[0]}`)
                  .remove()
                  .then(
                    this.setState({
                      removeFromDB: true,
                      deleteAcctModal: false,
                    })
                  )
                  .catch(() => this.setState({ removeFromDB: false }));
              }
            });
          }

          // Remove the child acct from the db
          firebase
            .database()
            .ref(`users/${childID}`)
            .remove()
            .then(this.setState({ removeFromDB: true, deleteAcctModal: false }))
            .catch(() => this.setState({ removeFromDB: false }));
        } else {
          // Disable children accts when parent deletes their acct
          const childrenRef = firebase
            .database()
            .ref(`users/${this.state.user.uid}/children`);

          childrenRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
              const childIDs = Object.values(data);
              childIDs.forEach(child => {
                firebase
                  .database()
                  .ref(`users/${child.id}`)
                  .update({ hasAccess: false, parentID: null })
                  .then(
                    this.setState({
                      removeFromDB: true,
                      deleteAcctModal: false,
                    })
                  )
                  .catch(() => this.setState({ removeFromDB: false }));
              });
            }
          });

          // Remove acct from db
          firebase
            .database()
            .ref(`users/${this.state.user.uid}`)
            .remove()
            .then(this.setState({ removeFromDB: true, deleteAcctModal: false }))
            .catch(() => this.setState({ removeFromDB: false }));
        }
      })
      .catch(error =>
        this.setState({
          formErrors: true,
          formMessage: error,
        })
      );
  };

  render() {
    return (
      <div className="App">
        {/* Add header if user details have been added to state */}
        {this.state.userDetails ? (
          <Header
            userDetails={this.state.userDetails}
            logOut={this.logOut}
            deleteAcctModal={this.deleteAcctModal}
          />
        ) : null}

        {/* If user is not logged in, display splash screen */}
        {/* If there is a message from deleting an account, display it */}
        {!this.state.user ? (
          <div className="authenticate">
            <img src={tv} alt="Television" className="bounce" />
            <h1>Screen Time!</h1>
            {/* TODO: Need to remove this if user deletes an acct and then immediately clicks to create a new acct */}
            {this.state.acctDeleteMsg ? (
              <div className="form-message error">
                <span>{this.state.acctDeleteMsg}</span>
              </div>
            ) : null}
            <Authenticate user={this.state.user} />
          </div>
        ) : null}

        {/* Display child/parent component based on access level */}
        {this.state.userDetails && this.state.userDetails.level === 'child' ? (
          <div className="child-acct">
            <ChildAcct
              user={this.state.user}
              userDetails={this.state.userDetails}
            />
          </div>
        ) : null}
        {this.state.userDetails && this.state.userDetails.level === 'parent' ? (
          <div className="parent-acct">
            <ParentAcct
              user={this.state.user}
              userDetails={this.state.userDetails}
            />
          </div>
        ) : null}

        {/* Display modal to confirm acct deletion */}
        {this.state.deleteAcctModal ? (
          <div className="modal fadeIn">
            <h2>Are You Sure You Want to Delete Your Account?</h2>
            <p>
              Removing your account will delete all of its data. If you are a
              parent, this will also disable use of this app for each child
              associated in your account.
            </p>
            <form action="" onSubmit={this.deleteAcct}>
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
              {this.state.formErrors ? (
                <div className={`form-message error`}>
                  <span>{this.state.formMessage.message}</span>
                </div>
              ) : null}
              <input type="submit" value="Delete My Account" />
              <br />
              <button
                className="tertiary"
                onClick={() =>
                  this.setState({
                    deleteAcctModal: false,
                    formErrors: false,
                    formMessage: null,
                  })
                }
              >
                Cancel
              </button>
            </form>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
