import { error, redirect } from "@sveltejs/kit";

export async function POST({ request }) {
    try {
    const formData = Object.fromEntries(await request.formData())
    let {file, delimeter} = formData
    if (!file.name || file.name === 'undefined') {
        error(400, 'You must provide a file to upload');
    }

    let buffer = Buffer.from(await file.arrayBuffer())

    
    return new Response({
            done: true
        });}
    catch (err) {
        console.log(err)
        error(500, err)
    }
};