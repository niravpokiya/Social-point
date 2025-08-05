import { useEffect, useState } from "react";
import axios from "axios";

export default function useFetchUser(username) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = username
        ? `/api/user/${username}` // ✅ fixed this
        : `/api/user/me`;
        console.log(username)
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
        console.log(res.data)
      } catch (err) {
        location.href="/login"
        setError(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);
  // here user comes null
  return { user, loading, error };
}
