import React from 'react';
import styled from 'styled-components';
import logout from '../svgs/logout.svg';
import deleteAcct from '../svgs/deleteAcct.svg';

const HeaderWrapper = styled.header`
  height: 10vh;
  min-height: 4rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.75rem 1rem 0.375rem;
  background: var(--color_brand_2);
  border-bottom: 3px solid #fff;

  .username {
    margin-right: auto;
    color: #fff;
    line-height: 1;
    text-align: left;
    font-weight: 700;
  }

  .btn {
    padding: 0;
    margin-left: 0.25rem;
    margin-bottom: 0;

    &:focus {
      outline: 1px dotted #fff;
    }

    img {
      width: 30px;
      height: 30px;
    }
  }
`;

const Header = props => {
  return (
    <HeaderWrapper>
      <span className="username">{props.userDetails.firstName}</span>
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
