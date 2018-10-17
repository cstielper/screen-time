import React, { Component } from 'react';
import styled from 'styled-components';
import firebase from '../../Firebase';
import ChildDetail from './ChildDetail';

const AddChildForm = styled.form`
  input[type='text'] {
    border: 1px solid #999;
  }
`;

const btnAddChildStyles = {
  marginTop: '1rem',
  marginBottom: '2rem',
};

class ParentAcct extends Component {
  constructor(props) {
    super(props);
    this.childInput = React.createRef();
    this.state = {
      children: {},
      addChild: false,
    };
    this.addChild = this.addChild.bind(this);
  }

  componentDidMount() {
    // Get all of the child IDs that are associated with our account
    let childKeys = null;
    if (this.props.userDetails.children) {
      childKeys = Object.keys(this.props.userDetails.children).map(
        key => this.props.userDetails.children[key].id
      );
    }

    if (childKeys) {
      const children = { ...this.state.children };
      childKeys.forEach(child => {
        const usersRef = firebase.database().ref(`users/${child}`);
        usersRef.on('value', snapshot => {
          const data = snapshot.val();
          children[child] = data;
          this.setState({ children });
        });
      });
    }
  }

  componentDidUpdate() {
    // Focus the modal window for A11y
    setTimeout(() => {
      if (this.state.addChild) {
        setTimeout(() => {
          this.childInput.current.focus();
        }, 50);
      }
    }, 50);
  }

  // UPDATE STATE AS USER ENTERS INFO INTO THE FORM
  updateUser = e => {
    const value = e.target.value;
    this.setState({ [`${e.target.name}`]: value });
  };

  // ADD A CHILD
  addChild = e => {
    e.preventDefault();

    // Some variables we will need
    const { childID, children } = this.state;
    const parentID = this.props.user.uid;

    // Check if the child exists in Firebase
    // If it does, edit the child entry in Firebase and map to a parent
    // Then update state to bring in the new child
    if (childID) {
      const usersRef = firebase.database().ref(`users`);
      usersRef.once('value', snapshot => {
        if (snapshot.hasChild(childID)) {
          firebase
            .database()
            .ref(`users/${childID}`)
            .update({ hasAccess: true, parentID });

          firebase
            .database()
            .ref(`users/${parentID}/children`)
            .push({ id: childID });

          const childRef = firebase.database().ref(`users/${childID}`);
          childRef.on('value', snapshot => {
            const data = snapshot.val();
            children[childID] = data;
            this.setState({ children });
          });

          this.setState({ addChild: false });
        } else {
          this.setState({
            formErrors: true,
            formMessage:
              "Sorry, but we can't seem to find that child. Please make sure you have entered the ID correctly.",
          });
        }
      });
    } else {
      this.setState({
        formErrors: true,
        formMessage: 'Please enter a valid child ID to create an account.',
      });
    }
  };

  render() {
    const msgType = this.state.formErrors ? 'error' : 'msg';

    return (
      <React.Fragment>
        {Object.keys(this.state.children).map(key => (
          <ChildDetail
            details={this.state.children[key]}
            key={key}
            childID={key}
          />
        ))}
        <button
          style={btnAddChildStyles}
          onClick={() => this.setState({ addChild: true })}
        >
          {this.props.userDetails.children
            ? 'Add Another Child'
            : 'Add A Child'}
        </button>
        {this.state.addChild ? (
          <AddChildForm
            action=""
            className="form-add-child modal fadeIn"
            onSubmit={this.addChild}
            role="dialog"
            ref={this.form}
          >
            {this.state.formMessage ? (
              <div className={`form-message ${msgType}`}>
                <span>{this.state.formMessage}</span>
              </div>
            ) : null}

            <input
              type="text"
              name="childID"
              placeholder="Enter Child ID"
              onChange={this.updateUser}
              ref={this.childInput}
            />
            <input type="submit" value="Create Account" className="btn" />
            <button
              onClick={() => this.setState({ addChild: false })}
              className="tertiary"
            >
              Cancel
            </button>
          </AddChildForm>
        ) : null}
      </React.Fragment>
    );
  }
}

export default ParentAcct;
