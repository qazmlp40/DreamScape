import { useState } from "react";

export default function useSignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [ID, setID] = useState("");
  const [PW, setPW] = useState("");
  const [checkPW, setCheckPW] = useState("");

  const reset = () => {
    setUsername("");
    setEmail("");
    setID("");
    setPW("");
    setCheckPW("");
  };

  return {
    username, setUsername,
    email, setEmail,
    ID, setID,
    PW, setPW,
    checkPW, setCheckPW,
    reset
  };
}
