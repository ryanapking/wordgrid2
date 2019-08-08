import React, { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';

import { setErrorMessage } from "../data/redux/messages";

const initialState = {
  parseObject: null,
  fetching: null,
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'fetching':
      return {...state, fetching: true};
    case 'fetchingComplete':
      return {...state, fetching: false};
    case 'setObject':
      return {...state, fetching: false, parseObject: action.parseObject};
    default:
      return {...state};
  }
};

export const useParseFetcher = (parseFunction, functionParams) => {
  const [state, localDispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch();

  const fetchObject = async () => {
    localDispatch({type: "fetching"});
    const parseObject = await parseFunction(functionParams)
      .catch((err) => {
        localDispatch({type: "fetchingComplete"});
        reduxDispatch(setErrorMessage(err));
      });
    localDispatch({type: "setObject", parseObject});
  };

  useEffect(() => {
    fetchObject().then();
  }, []);

  return [state.parseObject, state.fetching, fetchObject];
};