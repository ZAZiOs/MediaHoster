import { PostDB } from "$lib/model/post";
import { decodeTkn } from "$lib/check-token";
import config from '$lib/config.json'

export async function GET({ url, cookies }) {
    let query = Object.fromEntries(url.searchParams)
    console.log(query)
    if (config.private) {
        if (!decodeTkn(query.token)) {
            return new Response()
        }
    }

    let posts = await PostDB.find({}, {_id: 0}).limit(20).skip(20 * query.page)
    console.log(posts)
    return new Response(JSON.stringify(posts),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
}