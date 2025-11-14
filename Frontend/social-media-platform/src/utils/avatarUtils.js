import defaultAvatar from "../assets/default-avatar.png";

/**
 * Get avatar URL with fallback to default avatar
 * @param {string} avatarPath - The avatar path from user object
 * @returns {string} - Complete avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
  // Always return default avatar if no path provided
  if (!avatarPath || avatarPath === 'undefined' || avatarPath === null) {
    return defaultAvatar;
  }
  
  // If it's already a complete URL, return as is
  if (typeof avatarPath === 'string' && avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Otherwise, prepend the server URL
  return `http://localhost:5000${avatarPath}`;
};

/**
 * Get user avatar URL with fallback
 * @param {object} user - User object
 * @returns {string} - Complete avatar URL
 */
export const getUserAvatarUrl = (user) => {
  // Handle null or undefined user
  if (!user) {
    return defaultAvatar;
  }
  
  // Handle case where user.avatar might be undefined, null, or 'undefined' string
  const avatarPath = user.avatar;
  if (!avatarPath || avatarPath === 'undefined' || avatarPath === null || avatarPath === '') {
    return defaultAvatar;
  }
  
  return getAvatarUrl(avatarPath);
};