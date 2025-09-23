import React from 'react';
import styles from './SignUpForm.module.css';

type FormData = {
  username: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
};

type SignUpFormUIProps = {
  formData: FormData;
  error: string;
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const SignUpFormUI: React.FC<SignUpFormUIProps> = ({
  formData,
  error,
  onInputChange,
  onSubmit,
}) => {
  return (
    <div className={styles.signUpContainer}>
      <h2>Sign Up</h2>
      <form onSubmit={onSubmit} className={styles.signUpForm}>
        {/* Username and Nickname */}
        <div className={styles.formRow}>
          <div>
            <label className={styles.fieldLabel}>Username *</label>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={onInputChange('username')}
              className={styles.signUpInput}
              required
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Nickname</label>
            <input
              type="text"
              placeholder="Nickname"
              value={formData.nickname}
              onChange={onInputChange('nickname')}
              className={styles.signUpInput}
            />
          </div>
        </div>

        {/* First Name and Last Name */}
        <div className={styles.formRow}>
          <div>
            <label className={styles.fieldLabel}>First Name *</label>
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={onInputChange('firstName')}
              className={styles.signUpInput}
              required
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Last Name *</label>
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={onInputChange('lastName')}
              className={styles.signUpInput}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={styles.fieldLabel}>Email *</label>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={onInputChange('email')}
            className={styles.signUpInput}
            required
          />
        </div>

        {/* Password and Confirm Password */}
        <div className={styles.formRow}>
          <div>
            <label className={styles.fieldLabel}>Password *</label>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={onInputChange('password')}
              className={styles.signUpInput}
              required
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={onInputChange('confirmPassword')}
              className={styles.signUpInput}
              required
            />
          </div>
        </div>

        {/* Date of Birth and Gender */}
        <div className={styles.formRow}>
          <div>
            <label className={styles.fieldLabel}>Date of Birth *</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={onInputChange('dateOfBirth')}
              className={styles.signUpInput}
              required
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Gender *</label>
            <select
              value={formData.gender}
              onChange={onInputChange('gender')}
              className={styles.signUpSelect}
              required
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {error && <p className={styles.signUpError}>{error}</p>}
        
        <button type="submit" className={styles.signUpButton}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUpFormUI;