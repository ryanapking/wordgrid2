// copied and modified from here until react router officially supports hooks:
// https://github.com/ReactTraining/react-router/issues/6430#issuecomment-510266079

// TODO: Replace when possible

import { useContext } from 'react';
import { __RouterContext as RouterContext } from 'react-router';

export function useRouter() {
  return useContext(RouterContext);
}

export function useParams() {
  const { match } = useRouter();
  return match.params;
}

export function useHistory() {
  const { history } = useRouter();
  return history;
}