import React, { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';

import { setErrorMessage } from "../data/redux/messages";

const initialState = {
  returnValue: null,
  fetching: false,
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'fetching':
      return {...state, fetching: true};
    case 'fetchingComplete':
      return {...state, fetching: false};
    case 'setReturn':
      return {...state, fetching: false, returnValue: action.returnValue};
    default:
      return {...state};
  }
};

/**
 * Takes an async function or async generator function, returns the value(s) and fetching status.
 * Throws an error using redux if needed.
 *
 * @param {function} asyncFunction - Async fetcher function to run
 * @param {Object} functionParams - Should match param requirements for provided asyncFunction
 * @param {boolean} [isGenerator=false] - is the provided function a generator function
 *
 * @returns {[null|Object|Array, Boolean, Function]}
 */
export const useAsyncFetcher = (asyncFunction, functionParams, isGenerator = false) => {
  const [state, localDispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch();

  const fetchObject = async () => {
    localDispatch({type: "fetching"});
    const returnValue = await asyncFunction(functionParams)
      .catch((err) => {
        localDispatch({type: "fetchingComplete"});
        reduxDispatch(setErrorMessage(err));
      });
    localDispatch({type: "setReturn", returnValue});
  };

  const fetchGenerator = async () => {
    const generator = asyncFunction(functionParams);
    let valuesRemain = true;
    while (valuesRemain) {
      localDispatch({type: "fetching"});
      const { value, done } = await generator.next();
      if (done) valuesRemain = false;
      else localDispatch({type: "setReturn", returnValue: value});
    }
  };

  useEffect(() => {
    if (isGenerator) fetchGenerator().then();
    else fetchObject().then();
  }, []);

  return [state.returnValue, state.fetching, fetchObject];
};