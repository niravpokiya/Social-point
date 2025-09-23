import React from 'react';
import defaultAvatar from '../assets/default-avatar.png';

const Avatar = ({ 
  user, 
  size = 'w-10 h-10', 
  className = '', 
  alt,
  ...props 
}) => {
  const getAvatarSrc = () => {
    // Handle various edge cases
    if (!user) return defaultAvatar;
    
    const { avatar } = user;
    
    // Handle null, undefined, empty string, or 'undefined' string
    if (!avatar || avatar === 'undefined' || avatar === 'null' || avatar === '') {
      return defaultAvatar;
    }
    
    // If it's already a complete URL, return as is
    if (typeof avatar === 'string' && avatar.startsWith('http')) {
      return avatar;
    }
    
    // Otherwise, prepend the server URL
    return `http://localhost:5000${avatar}`;
  };

  const handleError = (e) => {
    e.target.src = defaultAvatar;
  };

  return (
    <img
      src={getAvatarSrc()}
      alt={alt || user?.name || user?.username || 'User Avatar'}
      className={`${size} rounded-full object-cover ${className}`}
      onError={handleError}
      {...props}
    />
  );
};

export default Avatar;