const { cookies } = require('next/headers');

async function setAuthCookie(token) {
    const cookiesStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8h en secondes
        path: '/',

    });
}

async function getAuthCookie() {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}

async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
}

module.exports = { setAuthCookie, getAuthCookie, clearAuthCookie };