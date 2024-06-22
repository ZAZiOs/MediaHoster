import { PostDB } from "$lib/model/post";
import { decodeTkn } from "$lib/check-token";
import { error } from "@sveltejs/kit";
import fs from 'fs'

export async function POST({ request }) {
    const data = await request.formData();
    const token = data.get('token')
    const file = data.get('file')

    let decoded = await decodeTkn(token)
    if (!decoded) {
        error(403, 'You must provide a token.');
    }
    if (!decoded.canAddStuff) {
        error(403, 'You dont have access to delete files.')
    }

    let post = await PostDB.findOneAndDelete({file})
    
    fs.unlinkSync('static' + post.file)
    fs.unlinkSync('static' + post.thumbnail)

    return new Response('{"test": "based"}',
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
}