/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post(/*req , res: Response (read the notes below) */) {
	// Unlike, Next.js API handlers you don't get the response object here. As a result, you cannot invoke the below method to set cookies on the responses.
	// await supabase.auth.api.setAuthCookie(req, response)
	// `supabaseClient.auth.api.setAuthCookie(req, res)` is dependent on both the request and the responses
	// `req` used to perform few validations before setting the cookies
	// `res` is used for setting the cookies
	return {
		status: 200,
		body: {}
	};
}
