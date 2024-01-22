const loginForm=document.querySelector('#loginForm');

loginForm.addEventListener('submit',onSubmit)

async function onSubmit(e) {
    e.preventDefault();
    console.log('onSubmit called');

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const data = {
        name,
        email,
        password
    };

    try {
        // Send the user data to the server to create the user
        const response = await axios.post('add-user', data);
        console.log(response.data,"....ids");

        const userId = response.data.userAdded.id;
        const token = response.data.token;
        console.log(userId, token);
        console.log(data);
        
      //  Add the user to the common group upon successful signup
        
        if (response.status === 201) {
            console.log('User added to the common group successfully!');
            
            // window.location.href = 'chat';
            // window.location.href = 'login';
        } else {
            console.error('Error adding user to the common group:', addToCommonGroupResponse.data.error);
        }
        e.target.name.value='';
        e.target.email.value='';
        e.target.password.value='';
    } catch (error) {
        console.error('Error during signup:', error);
    }
}

