<script>
export let data;

let {user, isLogged} = data

import config from '$lib/config.json'
import s from '$lib/strings.json'
import { 
    Button,
    ButtonGroup,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Input,
    InputGroup,
    InputGroupText,
    Icon
} from '@sveltestrap/sveltestrap';
import axios from 'axios';

let openAuth = config.private && !isLogged;
let openRegs = false
let openConf = false
let openUpload = false
let openAdmin = false

const toggle = () => { openAuth = !openAuth; openRegs = !openRegs; };
const toggleRegs = () => { openRegs = true; openAuth = false; }
const toggleAuth = () => { openRegs = false; openAuth = true; }

let passreg = ''
let passconf = ''

const handleSubmit = async (e) => {
    try {
        const formData = new FormData(e.target)
        console.log(formData)
        const res = await axios.post(`/api/upload`, formData);
    } catch (err) {
        console.log(err);
    }
};

let files = []

</script>


<!-- Логин -->
<Modal isOpen={openAuth} {toggle} keyboard={false} backdrop='static'>
    <form method="POST" action="?/login">
    <ModalHeader toggle={config.private ? false : () => openAuth = false}>{s.auth.title}</ModalHeader>
    <ModalBody>
        {#if config.private}
        {s.auth.desc_closed}
        {:else}
        {s.auth.desc}
        {/if}
        <InputGroup class="mt-2">
            <InputGroupText><Icon name="tag-fill" /></InputGroupText>
            <Input placeholder="Логин" name="login" />
        </InputGroup>
        <InputGroup class="mt-2">
            <InputGroupText><Icon name="shield-fill" /></InputGroupText>
            <Input placeholder="Пароль" name="pass" type="password"/>
        </InputGroup>
    </ModalBody>
    <ModalFooter>
        <Button type="button" color="primary" on:click={toggleRegs} outline>{s.register.title}</Button>
        <Button color="success">{s.auth.submit}</Button>
    </ModalFooter>
    </form>
</Modal>
<!-- Регистрация -->
<Modal isOpen={openRegs} {toggle} keyboard={false} backdrop='static'>
    <form method="POST" action="?/register">
    <ModalHeader toggle={config.private ? false : () => openRegs = false}>{s.register.title}</ModalHeader>
    <ModalBody>
        {#if config.registration == 'closed'}
            {s.register.closed} <br>
            {s.contact}
        {:else}
            <InputGroup class="mt-2">
                <InputGroupText><Icon name="tag-fill" /></InputGroupText>
                <Input placeholder="Логин" name="login" />
            </InputGroup>
            <InputGroup class="mt-2">
                <InputGroupText><Icon name="shield-fill" /></InputGroupText>
                <Input placeholder="Пароль" name="pass" type="password" bind:value={passreg}/>
            </InputGroup>
            <InputGroup class="mt-2">
                <InputGroupText><Icon name="shield" /></InputGroupText>
                <Input placeholder="Повторите пароль" type="password" bind:value={passconf}/>
            </InputGroup>
        {/if}
    </ModalBody>
    <ModalFooter>
        <Button type="button" color="primary" on:click={toggleAuth} outline>{s.auth.title}</Button>
        <Button color="success" disabled={!(passreg == passconf) || passreg.length == 0}>{s.register.submit}</Button>
    </ModalFooter>
    </form>
</Modal>
<!-- Сообщение о подтверждении регистрации-->
<Modal isOpen={openConf} keyboard={false} backdrop='static'>
    <ModalHeader>{s.register.title}</ModalHeader>
    <ModalBody> 
    </ModalBody>
</Modal>

<!-- Загрузка файлов -->

<Modal isOpen={openUpload} keyboard={false} backdrop='static'>
    <ModalHeader>{s.upload.title}</ModalHeader>
    <ModalBody>
        <form on:submit|preventDefault={handleSubmit}>
        <input class="form-control" type="file" id="files" name="files" multiple/>
        <Button>Upload</Button>
        {JSON.stringify(files)}
        </form>
    </ModalBody>
</Modal>

{#if config.private && !isLogged}
<div class="blur">
<div class="py-3 border-bottom bg-dark-subtle">
    <div class="container d-flex justify-content-between">
        <div>
            <button class="btn btn-outline-success px-2 py-1">{s.button.toUpload}</button>
        </div>
        <div>
            <button class="btn btn-outline-danger px-2 py-1">{s.button.logout}</button>
        </div>
    </div>
</div>

<div class="container">
    <div class="d-flex flex-column align-items-center mt-3">
    <h2 class="text-center">{s.main.title}</h2>
    {#if s.main.desc}<h5 class="text-center text-secondary">{s.main.desc}</h5>{/if}
    <div class="bg-dark-subtle px-3 py-2 border rounded text-center">
        <div class="text-secondary">{s.main.help.image}</div>
        <div class="text-warning">{s.main.help.video}</div>
        <div class="text-info">{s.main.help.gif}</div>
        <div class="text-success">{s.main.help.group}</div>
    </div>
    </div>
    <hr>
    <div class="row g-3">
        <div class="col-md-4"><div class="ph green border rounded"></div></div>
        <div class="col-md-4"><div class="ph red border rounded"></div></div>
        <div class="col-md-4"><div class="ph yellow border rounded"></div></div>
        <div class="col-md-4"><div class="ph yellow border rounded"></div></div>
        <div class="col-md-4"><div class="ph red border rounded"></div></div>
        <div class="col-md-4"><div class="ph white border rounded"></div></div>
        <div class="col-md-4"><div class="ph blue border rounded"></div></div>
        <div class="col-md-4"><div class="ph white border rounded"></div></div>
        <div class="col-md-4"><div class="ph green border rounded"></div></div>
        <div class="col-md-4"><div class="ph red border rounded"></div></div>
        <div class="col-md-4"><div class="ph green border rounded"></div></div>
        <div class="col-md-4"><div class="ph red border rounded"></div></div>
    </div>
</div>
</div>

{:else}

<div class="py-3 border-bottom bg-dark-subtle">
    <div class="container d-flex justify-content-between">
        <div class="row g-3 w-100">
        <div class="col-md-4 text-start">
            {#if user.canAddStuff}<button class="btn btn-outline-success px-2 py-1" on:click={() => openUpload = true}>{s.button.toUpload}</button>{/if}
        </div>
        <div class="col-md-4 text-center">
            {#if user.isAdmin}<button class="btn btn-outline-info px-2 py-1">{s.button.adminPanel}</button>{/if}
        </div>
        <div class="col-md-4 text-end">
            {#if isLogged}
            <form method="POST" action="/?/logout"><button class="btn btn-outline-danger px-2 py-1">{s.button.logout}</button></form>
            {:else}
            <button class="btn btn-outline-success px-2 py-1" on:click={toggleAuth}>{s.button.login}</button>
            {/if}
        </div>
        </div>
    </div>
</div>

<div class="container">
    <div class="d-flex flex-column align-items-center">
    <h2 class="mt-3 text-center">{s.main.title}</h2>
    {#if s.main.desc}<h5 class="text-center text-secondary">{s.main.desc}</h5>{/if}
    <div class="bg-dark-subtle px-3 py-2 border rounded text-center">
        <div class="text-secondary">{s.main.help.image}</div>
        <div class="text-warning">{s.main.help.video}</div>
        <div class="text-info">{s.main.help.gif}</div>
        <div class="text-success">{s.main.help.group}</div>
    </div>
    </div>
    <hr>
</div>

{/if}

<style>
.ph {
    width: 100%;
    aspect-ratio: 1/1;
}

.ph.green  { background-color: #6fc16f }
.ph.red    { background-color: #c16f6f }
.ph.yellow { background-color: #c1ab6f }
.ph.blue   { background-color: #6f9cc1 }
.ph.white  { background-color: #cecece }

.blur {
    filter: blur(50px);
    -webkit-filter: blur(10px);
}
</style>

