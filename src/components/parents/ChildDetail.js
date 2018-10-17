import React, { Component } from 'react';
import styled from 'styled-components';
import firebase from '../../Firebase';
import { formatTime } from '../../Helpers';
import addTime from '../../svgs/addTime.svg';
import subtractTime from '../../svgs/subtractTime.svg';
import enableDisable from '../../svgs/enableDisable.svg';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.125rem 1rem;
  text-align: left;
  border-bottom: 1px solid #fff;
  background: var(--color_brand_4);
  box-shadow: inset 0 -5px 8px -8px rgba(0, 0, 0, 1);

  .controls {
    width: 40%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;

    button {
      width: 2rem;
      height: 2rem;
      padding: 0;
      margin: 0.0625rem 0 0.0625rem 0.125rem;
      transition: opacity 0.25s;

      &.inactive {
        opacity: 0.45;

        &:hover {
          cursor: text;
        }
      }

      img {
        margin: -0.25rem 0 0 0.125rem;
        width: 1.75rem;
        height: 1.75rem;
      }

      &:focus {
        outline: 1px dotted #000;
      }
    }
  }

  .name-wrapper {
    width: 60%;
    transition: opacity 0.25s;

    .name {
      display: block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      font-size: 1.75em;
      font-family: 'Luckiest Guy', cursive;
      color: #fff;
      text-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
    }
  }

  &.inactive .name-wrapper {
    opacity: 0.45;
  }

  .time-left {
    font-weight: 700;

    .num {
      display: inline-block;
      padding: 0.3125rem 0.5rem;
      margin: 0 0.25rem;
      background: #fff;
    }

    span:last-of-type {
      display: none;
    }
  }
`;

class ChildDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.addTime = this.addTime.bind(this);
    this.subtractTime = this.subtractTime.bind(this);
    this.disableUser = this.disableUser.bind(this);
    this.enableUser = this.enableUser.bind(this);
  }

  componentWillMount() {
    this.setState({ details: this.props.details });
  }

  addTime = () => {
    const userRef = firebase.database().ref(`users/${this.props.childID}`);
    let timeRemaining;
    userRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        timeRemaining = data.timeRemaining + 300;
      }
    });

    userRef.update({ timeRemaining });
  };

  subtractTime = () => {
    const userRef = firebase.database().ref(`users/${this.props.childID}`);
    let timeRemaining;
    userRef.on('value', snapshot => {
      const data = snapshot.val();
      timeRemaining = data.timeRemaining - 300;
    });

    userRef.update({ timeRemaining });
  };

  disableUser = () => {
    const userRef = firebase.database().ref(`users/${this.props.childID}`);
    userRef.update({ hasAccess: false });
    const userState = { ...this.state.details };
    userState.hasAccess = false;
    this.setState({ details: userState });
  };

  enableUser = () => {
    const userRef = firebase.database().ref(`users/${this.props.childID}`);
    userRef.update({ hasAccess: true });
    const userState = { ...this.state.details };
    userState.hasAccess = true;
    this.setState({ details: userState });
  };

  render() {
    const status = this.state.details.hasAccess;
    return (
      <React.Fragment>
        {this.props.details ? (
          <Wrapper className={status ? 'active' : 'inactive'}>
            <div className="name-wrapper">
              <span className="name">{this.props.details.firstName}</span>
              <div className="time-left">
                {formatTime(this.props.details.timeRemaining).map(time => (
                  <React.Fragment key={time}>
                    <span className="num">{time}</span>
                    <span>:</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="controls">
              {this.props.details.hasAccess ? (
                <button
                  onClick={this.addTime}
                  disabled={this.props.details.timerRunning ? true : false}
                  className={
                    !this.props.details.timerRunning
                      ? 'secondary'
                      : 'secondary inactive'
                  }
                >
                  <img src={addTime} alt="Add time" />
                  <span className="screen-reader-text">Add screen time</span>
                </button>
              ) : null}

              {this.props.details.hasAccess ? (
                <button
                  onClick={this.subtractTime}
                  disabled={this.props.details.timerRunning ? true : false}
                  className={
                    !this.props.details.timerRunning
                      ? 'secondary'
                      : 'secondary inactive'
                  }
                >
                  <img src={subtractTime} alt="Subtract time" />
                  <span className="screen-reader-text">
                    Subtract screen time
                  </span>
                </button>
              ) : null}

              <button
                className="secondary"
                onClick={
                  this.props.details.hasAccess
                    ? this.disableUser
                    : this.enableUser
                }
              >
                <img src={enableDisable} alt="Enable/Disable Account" />
                <span className="screen-reader-text">
                  Enable/Disable Account
                </span>
              </button>
            </div>
          </Wrapper>
        ) : null}
      </React.Fragment>
    );
  }
}

export default ChildDetail;
