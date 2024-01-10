const loginForm=document.querySelector('#loginForm');
const messageElement=document.querySelector('#message')



loginForm.addEventListener('submit',onSubmit)

async function onSubmit(e){
    e.preventDefault();

    const email=e.target.email.value;
    const password=e.target.password.value;
    messageElement.innerHTML=''


    let data={
        email,
        password
    }
    console.log(data);
    e.target.email.value='';
    e.target.password.value=''

    try {
        const res = await axios.post('login', data);
        if (res.status === 200) {
            messageElement.innerText = res.data.message;
            messageElement.className = 'message-success';
            localStorage.setItem('token',res.data.token)  //? mind this
            window.location.href = 'chat';
        }
    } catch (error) {
        if (error.response) {
            messageElement.innerText = error.response.data.message;
            messageElement.className = 'message-error';
        } else if (error.request) {
            messageElement.innerText = 'No response from server';
            messageElement.className = 'message-error';
        } else {
            messageElement.innerText = 'Error in setting up the request';
            messageElement.className = 'message-error';
        }
    }
}