import { css } from 'lit';

export const sharedInputStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    width: 100%;
  }
  input {
    font-family: inherit;
    font-size: 12px;
    font-weight: 300;
    padding: 1px 0;
    border: none;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    background: transparent;
    color: #d1d5db; /* gray-300 */
    transition: border-color 0.15s;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    line-height: 1;
  }
  input:focus {
    outline: none;
    border-bottom: 1px solid #3b82f6; /* blue-500 */
    box-shadow: none;
  }
`;
