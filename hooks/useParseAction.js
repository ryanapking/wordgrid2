import React, { useState } from 'react';
import { useDispatch } from "react-redux";

import { setErrorMessage } from "../data/redux/messages";

export const useParseAction = (parseAction) => {
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState(null);
  const dispatch = useDispatch();
  const callAction = async (paramObject) => {
    setPending(true);
    const response = await parseAction(paramObject)
      .catch((err) => {
        setPending(false);
        dispatch(setErrorMessage(err));
      });
    setPending(false);
    setResponse(response);
  };
  const clearResponse = () => {
    setResponse(null);
  };
  return [callAction, pending, response, clearResponse];
};
