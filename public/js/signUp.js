const loginForm=document.querySelector('#loginForm');



loginForm.addEventListener('submit',onSubmit)

async function onSubmit(e){
    e.preventDefault();
    const name=e.target.name.value;
    const email=e.target.email.value;
    const password=e.target.password.value;


    let data={
        name,
        email,
        password
    }
    console.log(data);
    e.target.name.value='';
    e.target.email.value='';
    e.target.password.value='';

    const res=await axios.post('add-user',data)
    console.log(data)

}

