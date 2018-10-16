import React from 'react';
import styled from 'styled-components';
import logout from '../svgs/logout.svg';
import deleteAcct from '../svgs/deleteAcct.svg';

const HeaderWrapper = styled.header`
  height: 10vh;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.75rem 1rem 0.375rem;
  background: var(--color_brand_2);
  border-bottom: 3px solid #fff;

  .username {
    font-family: 'Luckiest Guy', cursive;
    margin-right: auto;
    color: #fff;
    font-size: 1.25rem;
    letter-spacing: 0.03125em;
    line-height: 1;
    text-align: left;
  }

  .btn {
    padding: 0;
    margin-left: 0.25rem;

    img {
      width: 35px;
      height: 35px;
    }
  }
`;

const Header = props => {
  return (
    <HeaderWrapper>
      <span className="username">{props.userDetails.name}</span>
      <button className="btn" onClick={props.deleteAcctModal}>
        <span className="screen-reader-text">Delete Account</span>
        <img src={deleteAcct} alt="Delete account" />
      </button>
      <button className="btn" onClick={props.logOut}>
        <span className="screen-reader-text">Logout</span>
        <img src={logout} alt="Logout" />
      </button>
    </HeaderWrapper>
  );
};

export default Header;
