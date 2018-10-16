import React, { Component } from 'react';
import styled from 'styled-components';
import firebase from '../../Firebase';
import { formatTime } from '../../Helpers';

const Wrapper = styled.div`
  width: 85vw;
  max-width: 30em;
  margin: -5rem auto 0;

  h1 {
    font-size: 2.875em;
    text-shadow: 3px 3px 0 #000;
  }

  input:read-only {
    color: #999;
  }

  .time-left {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0 2em;
    font-weight: 700;
    font-size: 1.5em;

    span {
      display: inline-block;
      padding: 0.625rem;
      font-size: 2em;

      &:last-of-type {
        display: none;
      }
    }

    .num {
      background: #fff;
    }
  }

  .btn-alt {
    width: 50vw;
    max-width: 20rem;
    background: var(--color_brand_3);
  }
`;

class ChildAcct extends Component {
  constructor(props) {
    super(props);
    this.uidInput = React.createRef();
    this.state = { copySuccess: null, timerRunning: false };
  }

  // SET OUR INTIAL INFO. IF THE CHILD CLOSED THE APP WITHOUT TURNING OFF THE TIMER, WRITE TO THE DB THAT THE TIMER IS NOT RUNNING
  componentDidMount() {
    this.setState({ timeRemaining: this.props.userDetails.timeRemaining });
    const uid = this.props.user.uid;
    firebase
      .database()
      .ref(`users/${uid}/timerRunning`)
      .set(false);
  }

  copyToClipboard = e => {
    e.preventDefault();
    this.uidInput.current.select();
    document.execCommand('copy');
    this.setState({
      copySuccess:
        'Your ID has been copied. Text or email it to your parent so that they can add you to their account.',
    });
    this.modalCountdown();
  };

  // REMOVE THE MODAL WINDOW AFTER 10 SECONDS
  modalCountdown = () => {
    this.setState({ modalCountdownRunning: true, modalTimeRemaining: 10 });
    this.interval = setInterval(() => {
      if (this.state.modalTimeRemaining > 0) {
        this.setState(prevState => ({
          modalTimeRemaining: prevState.modalTimeRemaining - 1,
          modalCountdownRunning: true,
        }));
      } else {
        this.setState({ modalCountdownRunning: false, copySuccess: null });
      }
    }, 1000);
  };

  startTimer = () => {
    // This fixes an issue where a parent adds more time while the child is logged in
    if (this.state.timeRemaining !== this.props.userDetails.timeRemaining) {
      this.setState({ timeRemaining: this.props.userDetails.timeRemaining });
    }

    this.interval = setInterval(() => {
      this.updateTime();
    }, 1000);
  };

  stopTimer = () => {
    const uid = this.props.user.uid;
    firebase
      .database()
      .ref(`users/${uid}/timerRunning`)
      .set(false);

    this.setState({ timerRunning: false });
    clearInterval(this.interval);
  };

  updateTime = () => {
    if (this.state.timeRemaining > 0 && this.props.userDetails.hasAccess) {
      this.setState(prevState => ({
        timeRemaining: prevState.timeRemaining - 1,
        timerRunning: true,
      }));

      const uid = this.props.user.uid;
      firebase
        .database()
        .ref(`users/${uid}/timeRemaining`)
        .set(this.state.timeRemaining);

      firebase
        .database()
        .ref(`users/${uid}/timerRunning`)
        .set(true);
    } else {
      this.stopTimer();
    }
  };

  render() {
    return (
      <Wrapper>
        {!this.props.userDetails.hasAccess ? (
          <div>
            <p>
              You need to ask your parent's permission before you can use this
              app.
            </p>
            <p>
              Send these numbers and letters to your parent, so that they can
              add you to their account:
            </p>
            <form action="">
              <input
                type="text"
                value={this.props.user.uid}
                ref={this.uidInput}
                readOnly
              />
              <button className="btn-alt" onClick={this.copyToClipboard}>
                Copy
              </button>
              {this.state.copySuccess ? (
                <span className="modal">{this.state.copySuccess}</span>
              ) : null}
            </form>
            <p>
              If you've used this app before, you will need to ask your parents
              to re-enable your account to keep using it.
            </p>
          </div>
        ) : (
          <React.Fragment>
            {this.props.userDetails.timeRemaining > 0 ? (
              <div>
                <h2>Time Remaining</h2>
                <div className="time-left">
                  {formatTime(this.props.userDetails.timeRemaining).map(
                    time => (
                      <React.Fragment key={time}>
                        <span className="num">{time}</span>
                        <span>:</span>
                      </React.Fragment>
                    )
                  )}
                </div>
                <button
                  className="btn-alt"
                  onClick={
                    this.state.timerRunning ? this.stopTimer : this.startTimer
                  }
                >
                  {this.state.timerRunning ? 'Stop Timer' : 'Start Timer'}
                </button>
              </div>
            ) : (
              <div>
                <h2>Oh no, you've used all of your screen time!</h2>
                <p>You'll have to ask your parents for more.</p>
              </div>
            )}
          </React.Fragment>
        )}
      </Wrapper>
    );
  }
}

export default ChildAcct;
