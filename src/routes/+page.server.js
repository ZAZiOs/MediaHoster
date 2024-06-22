import { UserDB } from '$lib/model/users.js';
import { token_secret_gen } from "$lib";
import { redirect } from '@sveltejs/kit';
import config from '$lib/config.json';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const actions = {
    register: async ({cookies, request}) => {
        const formData = Object.fromEntries(await request.formData());
        let { login, pass } = formData
        
        if (config.registration == 'closed') { redirect(302, '/?closed')}
        if (!login || !pass) { redirect(302, '/?reg_nodata') }
		if (await UserDB.findOne({ login })) { redirect(302, '/?exist') }

        let isFirst = (await UserDB.find({})).length <= 0
        
        let encryptedPassword = await bcrypt.hash(String(pass), 10);
        let token_check = token_secret_gen()

        const user = await UserDB.create({
			login,
			pass: encryptedPassword,
            confirmed: (isFirst || !(config.registration == 'secure')),
            canAddStuff: isFirst,
            isAdmin: isFirst,
			token_check
		})

        if (!(config.registration == 'secure')) {
            const token = jwt.sign(
				{ user_id: user._id, check: user.token_check },
				String(process.env.TOKEN_KEY),
				{
				expiresIn: config.token_expire,
				}
			);
			cookies.set('token', token, {path: '/'})
            redirect(302, '/')
        }

		redirect(302, '/?registered')

    },
    login: async ({ cookies, request }) => {
		const formData = Object.fromEntries(await request.formData());
        let {login, pass} = formData

		if (!login || !pass) { redirect(302, '/?login_nodata') }

		const user = await UserDB.findOne({ login });

		if (!user) {redirect(302, '/?nouser')}
		if (!user.confirmed && config.registration == 'secure') {redirect(302, '/?noaccept')}
		if (!user.token_check) {user.token_check = token_secret_gen(); user.save()}

		if (await bcrypt.compare(String(pass), user.pass)) {
			const token = jwt.sign(
				{ user_id: user._id, check: user.token_check },
				String(process.env.TOKEN_KEY),
				{
				expiresIn: config.token_expire,
				}
			);
			cookies.set('token', token, {path: '/'})
			redirect(302, '/')
		}
		else {
			redirect(302, '/?wrongpass')
		}
	},
    logout: async ({cookies}) => {
        cookies.delete('token', {path: '/'})
    }
};


import { decodeTkn } from '$lib/check-token.js';
import { PostDB } from '$lib/model/post';

export async function load({cookies, params, url}) {
	const decoded = await decodeTkn(cookies.get('token'))
	if (config.private && !decoded) {
		return {
			isLogged: false
		}
	}
	
	let page = url.searchParams.get('page');
	if (!page) { page = 0 }

	let posts = await PostDB.find({}, {_id: 0}).limit(20).skip(20 * page).lean()
	let rendered_posts = ''

	const template = `
	<div class="col-md-4">
		<a href=LINKTOACTION>
			<img class="card card-img border-COLOR" src=THUMB alt="image">
		</a>
    </div>
	`

	for (let post of posts) {
		let result = template.replace('LINKTOACTION', post.file).replace('THUMB', post.thumbnail)

		switch(posts.filetype) {
			case 'image':
				if (post.file.includes('gif')) {
					result.replace('COLOR', 'info')
				} else {
					result.replace('COLOR', 'secondary')
				}
				break;
			case 'video':
				result.replace('COLOR', 'warning')
				break;
		}

		rendered_posts += result
	}

    if (!decoded) {
        return {
			posts,
            user: {},
            isLogged: false,
			token: 'xxx'
        }
    }
    return {
		posts,
        user: decoded,
        isLogged: true,
		token: cookies.get('token')
    }
}