import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.png';
import axios from '../utils/axiosInstance';

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', username: '', bio: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true); 
  

  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/user/me');
        const { name, username, bio, avatar } = res.data;

        setFormData({ name, username, bio: bio || '', avatar: avatar || '' });

        // ✅ Fix here: set full URL if avatar exists
        if (avatar) {
          setPreviewUrl(`http://localhost:5000${avatar}`);
        } else {
          setPreviewUrl(null);
        }
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
        let avatarUrl = formData.avatar;

        if (avatarFile) {
          const formDataUpload = new FormData();
          formDataUpload.append('avatar', avatarFile);
          const uploadRes = await axios.post('/api/user/upload-avatar', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          avatarUrl = uploadRes.data.url;
        }

        const res = await axios.put('/api/user/me', {
          ...formData,
          avatar: avatarUrl,
        });

        // ✅ Just redirect, don't call undefined setUser
        navigate('/profile', { state: { updatedUser: res.data } });

      } catch (err) {
        console.error(err);
        alert('Failed to update profile');
      }
    };

 
  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={previewUrl || defaultAvatar}
          alt="Avatar Preview"
          className="w-24 h-24 rounded-full object-cover border border-gray-500"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="mt-2 px-4 py-1 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded"
        >
          Change Avatar
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="border rounded p-2 bg-gray-900 text-white placeholder-gray-400"
        />
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="border rounded p-2 bg-gray-900 text-white placeholder-gray-400"
        />
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="border rounded p-2 bg-gray-900 text-white placeholder-gray-400"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
