import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setErrorMessage } from "../../data/redux/messages";

export const useParseFetcher = (parseFunction, functionParams) => {
  const [parseObject, setParseObject] = useState(null);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();

  const fetchObject = async () => {
    setFetching(true);
    const parseObject = await parseFunction(functionParams)
      .catch((err) => {
        setFetching(false);
        dispatch(setErrorMessage(err));
      });
    setFetching(false);
    setParseObject(parseObject);
  };

  useEffect(() => {
    fetchObject().then();
  }, []);

  return [parseObject, fetching, fetchObject];
};