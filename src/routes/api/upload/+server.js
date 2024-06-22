import { error, redirect } from "@sveltejs/kit";
import { decodeTkn } from "$lib/check-token.js";
import { PostDB } from "$lib/model/post";
import config from '$lib/config.json'
import fs from 'fs'
import mt from 'media-thumbnail'
import it from 'image-thumbnail'

export async function POST({ request }) {
    try {
    const data = await request.formData();
    const token = data.get('token')
    let decoded = await decodeTkn(token)
    console.log(decoded)
    if (!decoded) {
        error(403, 'You must provide a token.');
    }
    if (!decoded.canAddStuff) {
        error(403, 'You dont have access to upload files.')
    }
    const files = data.getAll('file')
    
    // ОБЯЗАТЕЛЬНО ДОБАВИТЬ ПРОВЕРКУ НА ТО ЧТО У ПОЛЬЗОВАТЕЛЯ ЕСТЬ ПРАВО НА ЗАГРУЗКУ!

    if (!files) {
        error(400, 'You must provide a file to upload');
    }
    let response = {
        image: 0,
        video: 0
    }

    files.forEach(file => {
        doFile(file, response)
    })

    async function doFile(file) {
        console.log(file)
        let file_ext = file.name.split('.').pop()
        let filename = `${config.filenamePrefix}${file.size}_${file.lastModified}.${file_ext}`
        let filetype = file.type.split('/')[0]
        console.log(filename, filetype)
        let filebuff = Buffer.from(await file.arrayBuffer())
        
        let errs = false
        
        await fs.mkdir(`static/posts/thumbnail`, { recursive: true }, (err) => {if (err) throw err;});
    
        if (filetype == 'image') {
            it(filebuff, { width: config.media.width, jpegOptions: { force: true, quality: config.media.jpeg_quality}})
            .then(thumb_buff =>{
                fs.writeFileSync(`static/posts/${filename}`, filebuff)
                fs.writeFileSync(`static/posts/thumbnail/${filename}_thumb.jpeg`, thumb_buff)
                response.image++
            })
            .catch(err => {console.log(err); errs = !errs})
        } else if (filetype == 'video') {
            mt.forVideo(
                `./static/posts/${filename}`,
                `./static/posts/thumbnail/${filename}_thumb.jpeg`, {
                width: config.media.width
            })
            .then(() => { response.video++ })
            .catch(err => {console.log(err); errs = !errs})
        }
    
        if (!errs) {
            await PostDB.create({
                file: `/posts/${filename}`,
                filetype,
                thumbnail: `/posts/thumbnail/${filename}_thumb.jpeg`
            })
        }
    }

    return new Response(JSON.stringify(response),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    catch (err) {
        console.log(err)
        error(500, err)
    }
};


