//Стандартная процедура:
let express = require(`express`);
let app = express();
app.use(express.static(`static`)); //Зарегистрировать маршруты для файлов, беря их из папки static.
app.use(express.urlencoded({ extended: true }));

//npm install hbs - Шаблонизатор Handlebars.
const hbs = require(`hbs`);
TemplateDir = 'views'
app.set('views', TemplateDir)
app.set('view engine', 'hbs')

//npm install --save cookie-parser - Кукипарсер.
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const fs = require('fs');
const multer = require("multer");
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/content')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, 'feniksUpload-' + Date.now() + '.' + extension)
    }
})
const upload = multer({ storage: storage });
const mt = require('media-thumbnail')
const imageThumbnail = require('image-thumbnail');
const e = require('express');

//Подгрузка конфига
let rawconfig = fs.readFileSync('config.json');
let Config = JSON.parse(rawconfig);

let port = Config["port"]
let userpass = Config["userpass"]
let adminpass = Config["adminpass"]
let projectadress = `${Config["address"]}`


app.listen(port, function () { //Запуск сервера.
    console.log(`\n${getTime()} Сервер запущен! ${projectadress}`)
})

function getTime() {
    let time = new Date().toLocaleTimeString('ru-RU', {
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });
    let date = new Date().toLocaleDateString('ru-RU', { day: "numeric", month: "numeric" });
    let result = "[" + date + "][" + time + "]"
    return result
}

//Главная, она же Авторизация
app.get('/', function (req, res) {
    let { auth } = req.cookies
    if (auth == userpass || auth == adminpass) {
        res.redirect('/main')
    } else {
    res.render(`login`, {})
    }
})

//Форма авторизации, проверка +запись в куки
app.post('/', function (req, res) {
    if (!req.body) return res.status(400).send('<h2>Ошибка 400</h2> Отправлен плохой запрос');
    pass = req.body.pass
    if (pass == userpass) {
        res.cookie('auth', userpass)
        res.redirect(`/main`)
    } else if (pass == adminpass) {
        res.cookie('auth', adminpass)
        res.redirect(`/main`)
    } else {
        res.render(`login`, {
            error: 'ОШИБКА: Неправильный пароль'
        })
    }
})

app.get('/logout', function (req, res) {
    res.cookie('auth', null)
    res.redirect(`/`)
})


//Главная страница.
app.get('/main', function (req, res) {
    if (req.cookies[`auth`] == userpass || req.query.pass == userpass) {
        let rawdata = fs.readFileSync('db.json');
        let RAWmassive = JSON.parse(rawdata);
        let final
        for (var file in RAWmassive) {
            let template = ``
            if (RAWmassive[file]["filetype"] == "video") {
                template = `
            <div class="col-md-4">
            <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
            <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img border-warning">
            </a>
            </div>`
            } else if (RAWmassive[file]["filetype"] == "image") {
                if (RAWmassive[file]["filename"].includes(".gif") || RAWmassive[file]["isAnim"]) {
                    template = `
                <div class="col-md-4">
                <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
                <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img border-info">
                </a>
                </div>`
                } else {
                template = `
            <div class="col-md-4">
            <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
            <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img">
            </a>
            </div>`
        }
            }
            final = template + final
        }
        let uploadbutton
        try {
            final = final.replace(`undefined`, ``)
        } catch (error) { console.log(`${getTime()} Так как страница пуста - Тут должна была вылезти ошибка. Данное сообщение тупо как уведомление, вместо ошибки.`) }
        res.render(`main`, {
            images: final,
            upload: uploadbutton
        })
    } else if (req.cookies[`auth`] == adminpass) {
        let rawdata = fs.readFileSync('db.json');
        let RAWmassive = JSON.parse(rawdata);
        let final
        for (var file in RAWmassive) {
            let template = ``
            if (RAWmassive[file]["filetype"] == "video") {
                template = `
            <div class="col-md-4">
            <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
            <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img border-warning">
            </a>
            <a href="/delete?file=${RAWmassive[file]["filename"]}" class="btn btn-outline-danger w-100 mt-2">Удалить медиа</a>
            </div>`
            } else if (RAWmassive[file]["filetype"] == "image") {
                if (RAWmassive[file]["filename"].includes(".gif") || RAWmassive[file]["isAnim"]) {
                    template = `
                <div class="col-md-4">
                <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
                <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img border-info">
                </a>
                <a href="/delete?file=${RAWmassive[file]["filename"]}" class="btn btn-outline-danger w-100 mt-2">Удалить медиа</a>
                </div>`
                } else {
                    template = `
                <div class="col-md-4">
                <a href="${RAWmassive[file]["dest"]}/${RAWmassive[file]["filename"]}">
                <img src="${RAWmassive[file]["dest"]}/${RAWmassive[file]["thumbnail"]}" class="card card-img">
                </a>
                <a href="/delete?file=${RAWmassive[file]["filename"]}" class="btn btn-outline-danger w-100 mt-2">Удалить медиа</a>
                </div>`
                }
            }
            final = template + final
        }
        let uploadbutton = `<a class="btn btn-outline-warning text-center mb-3 butwid" href="/upload">Загрузить</a>`
        try {
            final = final.replace(`undefined`, ``)
        } catch (error) { console.log((`${getTime()} Так как страница пуста - Тут должна была вылезти ошибка. Данное сообщение тупо как уведомление, вместо ошибки.`)) }
        res.render(`main`, {
            images: final,
            upload: uploadbutton
        })
    } else {
        res.render(`accessdenied`)
    }
})

//Функции для администратора
app.get(`/upload`, function (req, res) {
    if (req.cookies[`auth`] == adminpass) {
        res.render(`upload`, {
            projectadress: projectadress
        })
    } else {
        res.render('accessdenied')
    }
})

app.post(`/photos/upload`, upload.array("files"), uploadFiles);

function uploadFiles(req, res) {
    if (!req.body) return res.status(400).json({ code: 400, error: "Плохой запрос, данные не получены" });
    let videocount = 0
    let imagecount = 0
    FilesUploaded = req.files
    function doLast() { res.json({ message: `Загружено:<br />x${imagecount} Изображений<br />x${videocount} Видео` }) }
    function doFirst(touse, callback) {
        FilesUploaded.forEach(file => {
            let filename = file["filename"]
            let dest = String(file["destination"].split('/').splice(2, 2))
            let filetype = String(file["mimetype"].split('/').splice(0, 1))
            let thumbnail = `thumb/${filename}_thumb.jpeg`

            console.log(`${getTime()} Получен ${filename} [${filetype}]`)
            if (filetype == "video") {
                videocount = videocount + 1;
                var thumbgen = true
                mt.forVideo(
                    `./static/${dest}/${filename}`,
                    `./static/${dest}/${thumbnail}`, {
                    width: 300
                })
                    .then(() => { console.log(`${getTime()} ${thumbnail} сохранена.`); }, err => console.log(err))
            } else if (filetype == "image") {
                var thumbgen = true
                imagecount = imagecount + 1;
                imageThumbnail(`./static/${dest}/${filename}`, { width: 300, jpegOptions: { force: true, quality: 75 } })
                    .then(thumbnailRes => { fs.writeFileSync(`./static/${dest}/${thumbnail}`, thumbnailRes); console.log(`${getTime()} ${thumbnail} сохранена.`); })
                    .catch(err => { console.log(err); console.log(`${getTime()} Что-то явно пошло не так при генерации превью`) });
            } else {
                console.log(`${getTime()} ОШИБКА! Данный тип файла не поддерживается на данном хосте.`)
                fs.unlinkSync(`./static/${dest}/${filename}`);
                var thumbgen = false
            }
            let rawdata = fs.readFileSync('db.json');
            let RAWmassive = JSON.parse(rawdata);

            if (thumbgen) {
                console.log(`${getTime()} ${filename} [${filetype}] - загружен в БД`)
                let result = { "filename": filename, "dest": dest, "filetype": filetype, "thumbnail": thumbnail }
                RAWmassive[filename] = result
                let data = JSON.stringify(RAWmassive, null, 4);
                fs.writeFileSync('db.json', data);
            }
        }); doLast()
    }
    doFirst()
}


app.get('/delete', function (req, res) {
    if (req.cookies[`auth`] == adminpass) {
        res.render('ausure', {
            file: req.query.file
        })
    } else {
        res.render('accessdenied')
    }
})

app.get('/deleteconfirm', function (req, res) {
    if (req.cookies[`auth`] == adminpass) {
        file2delete = req.query.file
        let rawdata = fs.readFileSync('db.json');
        let RAWmassive = JSON.parse(rawdata);
        try { fs.unlinkSync(`./static/${RAWmassive[file2delete]["dest"]}/${RAWmassive[file2delete]["filename"]}`); } catch { console.log(`${getTime()} Произошла ошибка при удалении файла. (Возможно он уже удалён?)`) }
        try { fs.unlinkSync(`./static/${RAWmassive[file2delete]["dest"]}/${RAWmassive[file2delete]["thumbnail"]}`); } catch { console.log(`${getTime()} Произошла ошибка при удалении превью. (Возможно она уже удалена?)`) }
        console.log(`${getTime()} ${RAWmassive[file2delete]["filename"]} удалён.`)
        delete RAWmassive[file2delete]
        let data = JSON.stringify(RAWmassive, null, 4);
        fs.writeFileSync('db.json', data);
        res.redirect('/main')
    } else {
        res.render('accessdenied')
    }
})

//404
app.get('*', function (req, res) {
    res.render('404')
})
