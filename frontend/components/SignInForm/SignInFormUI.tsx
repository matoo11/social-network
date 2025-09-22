import React from 'react';
import styles from './SignInForm.module.css';

type SignInFormUIProps = {
  email: string;
  password: string;
  error: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const SignInFormUI: React.FC<SignInFormUIProps> = ({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className={styles.signInContainer}>
      <h2>Sign In</h2>
      <form onSubmit={onSubmit} className={styles.signInForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
          className={styles.signInInput}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
          className={styles.signInInput}
          required
        />
        {error && <p className={styles.signInError}>{error}</p>}
        <button type="submit" className={styles.signInButton}>
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignInFormUI;
