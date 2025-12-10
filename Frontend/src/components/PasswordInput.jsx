import React, { useState } from 'react'
import './PasswordInput.css'

const PasswordInput = ({ value, onChange, placeholder, required, maxLength, className = '' }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="password-input-wrapper">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`input password-input ${className}`}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>
    </div>
  )
}

export default PasswordInput

