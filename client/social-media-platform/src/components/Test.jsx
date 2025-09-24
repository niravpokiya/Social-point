import React from "react";
import useFetchUser from "../Hooks/useFetchUser";

export default function Test() {
  const { user, loading, error } = useFetchUser();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <h1>{user?.username}</h1>
    </>
  );
}
a