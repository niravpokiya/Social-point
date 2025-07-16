import { useEffect, useState } from "react";

export default function useFetchUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // optional
  const [error, setError] = useState(null);     // optional

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
}
