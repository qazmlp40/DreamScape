import { useState } from "react";

export default function useLoginForm() {
  const [userID, setUserID] = useState("");
  const [userPW, setUserPW] = useState("");

  const reset = () => {
    setUserID("");
    setUserPW("");
  };

  return { userID, setUserID, userPW, setUserPW, reset };
}
