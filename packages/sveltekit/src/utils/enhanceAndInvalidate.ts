import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';

/**
 * The default enhance behaviour but it also calls invalidate on success or redirect
 */
export function enhanceAndInvalidate(form: HTMLFormElement) {
  return enhance(form, () => async ({ result }) => {
    await applyAction(result);
    if (result.type === 'redirect' || result.type === 'success') {
      await invalidateAll();
    }
  });
}
