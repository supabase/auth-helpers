import { sequence } from '@sveltejs/kit/hooks';
// import callback from './callback';
import session from './session';

export default sequence(
  // callback(),
  session()
);
