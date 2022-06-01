export async function post({ locals }: { locals: App.Locals }) {
    const { user, accessToken } = locals;
    return {
        status: 200,
        body: {
            user,
            accessToken
        }
    };
}