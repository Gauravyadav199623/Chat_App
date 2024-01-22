const socket = io(window.location.origin);

const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');
const fileInput = document.getElementById('imageInput'); // Add an input element for file uploads


let groupId

  // Event listener for receiving chat messages from the server
  

const token = localStorage.getItem('token');

        function parseJwt(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }
    const userId = parseJwt(token).userId;
    const tokenData=parseJwt(token)
    const tokenName=parseJwt(token).name
    // console.log(tokenData),"tokenDatatokenDatatokenDatatokenData"
socket.on('chatMessage', (data) => {
    console.log('Received chat message from server:', data);

    // Update the chat interface with the new message, image, or video
    if (data.messageType === 'text') {
        const messageHTML = `<p class="otherMessage"><strong>${data.name}:</strong> ${data.message}</p>`;
        chatBox.innerHTML += messageHTML;
    } else if (data.message && Array.isArray(data.message) && data.message.length > 0) {
        console.log("getting media>>>>>>>>>>>>>>>>>>>>");
        console.log(`Received ${data.messageType} URL:`, data.message);

        // Flatten the nested array and iterate through each image URL
        const flattenedImageUrls = data.message.flat();
        flattenedImageUrls.forEach(imageUrl => {
            let mediaHTML;
            if (data.messageType === 'image') {
                mediaHTML = `<p class="otherMessage"><strong>${data.name}:</strong> <img src="${imageUrl}" alt="Image" style="max-width: 300px; max-height: 200px; object-fit: contain;" /></p>`;
            } else if (data.messageType === 'video') {
                mediaHTML = `<p class="otherMessage"><strong>${data.name}:</strong> <video src="${imageUrl}" alt="Video" controls style="max-width: 500px; max-height: 500px; object-fit: contain;"></video></p>`;
            }

            if (mediaHTML) {
                chatBox.innerHTML += mediaHTML;
                updateScroll();
            } else {
                console.error('Invalid media data:', data);
            }
        });

        updateScroll();
    } else {
        console.error('Invalid media data:', data);
    }
});

    

function updateScroll() {
    chatBox.scrollTop = chatBox.scrollHeight;
}
    
const fetchChatData = async () => {
    try {
        // Retrieve messages from local storage
        const localMessages = getMessagesFromLocal();
        console.log(localMessages, "....localMessages");

        // Fetch new messages from the backend since the latest local message
        const latestLocalMessageTimestamp = getLatestLocalMessageTimestampForGroup(localMessages, groupId);
        const response = await axios.get('getChatData', { headers: { "Authorization": token, "Latest-Local-Timestamp": latestLocalMessageTimestamp } });
        console.log(response.data, "..........response.data");
        //!user
        let currentUserName = response.data.user.name;
        console.log(currentUserName);

        // Combine local and new messages
        const allMessages = [...localMessages, ...response.data.chat];

        // Save all messages to local storage
        saveMessagesToLocal(allMessages);

        // Update the chatBox with all messages
        chatBox.innerHTML = '';
        console.log(allMessages, "......allMessages");

    allMessages.forEach(msg => {
    const sender = msg.userId === userId ? 'You' : msg.user.name;
    const messageClass = msg.userId === userId ? 'userMessage' : 'otherMessage';

    if (msg.groupId === groupId) {
        const messageType = msg.isMedia ? msg.mediaType : 'text';

        if (messageType === 'text') {
            const messageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> ${msg.message}</p>`;
            chatBox.innerHTML += messageHTML;
        }

        if (messageType === 'image') {
            const imageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> <img src="${msg.message}" alt="Image" style="max-width: 300px; max-height: 200px; object-fit: contain;" /></p>`;
            chatBox.innerHTML += imageHTML;
        }

        if (messageType === 'video') {
            const videoHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> <video src="${msg.message}" alt="Video" style="max-width: 500px; max-height: 500px; object-fit: contain;"></video></p>`;
            chatBox.innerHTML += videoHTML;
        }
    }
});
        // Scroll to the bottom of the chatBox to show the latest messages
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error fetching chat data:', error);
    }
};


        // Function to retrieve messages from local storage
    const getMessagesFromLocal = () => {
            const storedMessages = localStorage.getItem('chatMessages');
            return storedMessages ? JSON.parse(storedMessages) : [];
        };

        // Function to get the timestamp of the latest local message
        const getLatestLocalMessageTimestampForGroup = (messages,groupId) => {
            if (messages.length > 0) {
                console.log(messages[messages.length - 1].createdAt+".......messages[messages.length - 1].createdAt");
                return messages[messages.length - 1].createdAt;
            }
            return null;
        };

        // Function to save messages to local storage
const saveMessagesToLocal = (newMessages) => {
    // Retrieve existing messages from local storage
    const storedMessages = getMessagesFromLocal();

    // Check if each new message already exists in the stored messages
    const uniqueNewMessages = newMessages.filter(newMsg => {
        const isNewMessage = !storedMessages.some(storedMsg => storedMsg.id === newMsg.id);
        return isNewMessage;
    });
//     const uniqueNewMessages = [];

// for (let i = 0; i < newMessages.length; i++) {
//     let isNewMessage = true;
//     for (let j = 0; j < storedMessages.length; j++) {
//         if (storedMessages[j].id === newMessages[i].id) {
//             isNewMessage = false;
//             break;
//         }
//     }
//     if (isNewMessage) {
//         uniqueNewMessages.push(newMessages[i]);
//     }
// }


    // Combine existing and unique new messages
    const allMessages = [...storedMessages, ...uniqueNewMessages];
    console.log(allMessages,".....allMessages");

    // Save the combined messages to local storage
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));
};


// Event listener for submitting messages
messageForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');

    const message = messageInput.value.trim();
    const files = fileInput.files;

    if (message === '' && files.length === 0) {
        return; // Don't send empty messages
    }

    try {
        if (files.length > 0) {
            // If files are selected, upload them and send the media URLs
            const formData = new FormData();
            formData.append('groupId', groupId);

            for (const file of files) {
                formData.append('media', file);
            }

            const response = await axios.post('/uploadMedia', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token
                }
            });

            // Determine the media type based on file extension
            const mediaType = response.data.mediaType;

            // Emit the 'chatMessage' event to the server with the media URLs and type
            socket.emit('chatMessage', { messageType: mediaType, message: response.data.mediaUrls, groupId, tokenName });
            fetchChatDataForGroup(groupId);
        } else {
            // Handle sending text messages
            const res = await axios.post('/postChat', { message, groupId }, { headers: { "Authorization": token } });

            if (res.status === 201) {
                // Emit the 'chatMessage' event to the server after successfully posting to the backend
                socket.emit('chatMessage', { messageType: 'text', message, groupId, tokenName });
                fetchChatDataForGroup(groupId);
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }

    messageInput.value = '';
    fileInput.value = '';
});







// Event listener for the "Create New Group" button
const createGroupButton = document.getElementById('createGroupButton');
createGroupButton.addEventListener('click', async () => {
    // Display the user selection popup
    displayUserSelectionPopup();
});

// Function to display the user selection popup
const displayUserSelectionPopup = async () => {
    try {
        // Fetch all users from the server
        const usersResponse = await axios.get('/getAllUsers', { headers: { "Authorization": token } });
        const allUsers = usersResponse.data.users;

        // Get the user list container
        const userListContainer = document.getElementById('userList');
        userListContainer.innerHTML = '';

        // Create checkboxes for each user
        allUsers.forEach(user => {
            const userContainer = document.createElement('div');
            userContainer.className = 'userContainer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'userCheckbox';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.appendChild(document.createTextNode(user.name));
            label.appendChild(checkbox);

            userListContainer.appendChild(label);
            userListContainer.appendChild(userContainer);
        });

        // Show the user selection popup
        const userSelectionPopup = document.getElementById('userSelectionPopup');
        userSelectionPopup.style.display = 'block';

        // Event listener for the "Add to Group" button
        const addUserToGroupButton = document.getElementById('addUsersToGroup');
        addUserToGroupButton.addEventListener('click', async () => {
            // Get the selected user IDs
            const selectedUserIds = Array.from(document.querySelectorAll('input[name=userCheckbox]:checked'))
                .map(checkbox => checkbox.value);

            // Close the user selection popup
            userSelectionPopup.style.display = 'none';

            // Use the selectedUserIds as needed (e.g., add them to the group)
            console.log('Selected User IDs:', selectedUserIds);

            // Prompt for the group name
            const groupName = prompt('Enter group name:');

            try {
                if (groupName) {
                    // Send a request to create a group and add users to it
                    const response = await axios.post('/createGroup', { groupName, members: selectedUserIds }, { headers: { "Authorization": token } });

                    if (response.status === 201) {
                        // Group created successfully
                        fetchGroupsData();
                        alert('Group created successfully!');
                    }
                } else {
                    alert('Group name cannot be empty. Please try again.');
                }
            } catch (error) {
                console.error('Error creating group:', error);
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        
    }
};


// Fetch and display groups on page load
const groupListContainer = document.getElementById('groupList');
groupListContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        console.log(event.target.id,".............event");
        // Set the current group ID when a group button is clicked
        currentGroupId =groupId
        // Fetch and display chat data for the clicked group
        fetchChatDataForGroup(currentGroupId);
    }
});

// Function to fetch updated groups data
const fetchGroupsData = async () => {
    try {
        // Fetch groups from the server
        console.log("...fetchGroupsData123");

        // Fetch user-specific group data
        const userGroupsResponse = await axios.get('/getUserGroups', { headers: { "Authorization": token } });
        const userGroups = userGroupsResponse.data.groups;
        console.log(userGroupsResponse.data.groups);

        const groupListContainer = document.getElementById('groupList');
        groupListContainer.innerHTML = '';

        // Create a button for each group that the user is a member of
        console.log(userGroups,"............userGroups")
        userGroups.forEach(group => {
            const groupButton = document.createElement('button');
            groupButton.textContent = group.groupName;
            groupButton.className="btn btn-primary buttonGrp"
            // groupButton.className="buttonGrp"
            groupButton.addEventListener('click', () => {
                // Navigate to the group chat page
                groupId = group.id;
                console.log(groupId, "....groupId");
                fetchChatDataForGroup(groupId);
            });

            const listItem = document.createElement('li');
            listItem.appendChild(groupButton);
            groupListContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching user-specific groups:', error);
    }
};

 // Function to fetch and display chat data for a specific group
 const fetchChatDataForGroup = async (groupId) => {
    try {

        
        // Retrieve messages from local storage
        const localMessages = getMessagesFromLocal();
        console.log(localMessages, "....localMessages");


        const latestLocalMessageTimestamp = getLatestLocalMessageTimestampForGroup(localMessages, groupId);



        const response = await axios.get(`/chatgetChatData/${groupId}`, { headers: { "Authorization": token, "Latest-Local-Timestamp": latestLocalMessageTimestamp } });

        const groupChat = response.data.chat;
        console.log(response, ".......fetchChatDataForGroup");
        console.log(groupChat, "....groupChat");


        
        // Combine local and new messages
        const allMessages = [...localMessages, ...response.data.chat];

        saveMessagesToLocal(allMessages);


        // Fetch all users
        const usersResponse = await axios.get('/getAllUsers', { headers: { "Authorization": token } });
        const users = usersResponse.data.users;

        // Update the chat box with group chat data
        const chatBox = document.getElementById('chatBox');
        chatBox.innerHTML = '';

        allMessages.forEach(msg => {
            const user = users.find(user => user.id === msg.userId);

            const sender = msg.userId === userId ? 'You' : (user?.name || 'Unknown User');
            const messageClass = msg.userId === userId ? 'userMessage' : 'otherMessage';
        
            if (msg.groupId === groupId) {
                const messageType = msg.isMedia ? msg.mediaType : 'text';
        
                if (messageType === 'text') {
                    const messageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> ${msg.message}</p>`;
                    chatBox.innerHTML += messageHTML;
                }
        
                if (messageType === 'image') {
                    const imageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> <img src="${msg.message}" alt="Image" style="max-width: 300px; max-height: 200px; object-fit: contain;" /></p>`;
                    chatBox.innerHTML += imageHTML;
                }
        
                if (messageType === 'video') {
                    const videoHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> <video src="${msg.message}" alt="Video" style="max-width: 300px; max-height: 200px; object-fit: contain;"></video></p>`;
                    chatBox.innerHTML += videoHTML;
                }
            }
        });
        // socket.emit('chatMessage', {message, groupId} );


        // Scroll to the bottom of the chatBox to show the latest messages
        chatBox.scrollTop = chatBox.scrollHeight;
        let socketGroupId = groupId;

console.log(socketGroupId,"><<<<<<<<><><<>><<>><<>><><<>socketGroupId");
socket.emit('joinGroup', socketGroupId); // Make sure 'groupId' is set before calling this line
    } catch (error) {
        console.error('Error fetching group chat data:', error);
    }
};

async function removeUserFromGroup(memberId, li, groupId) {
    console.log("removeUser");
    
    try {
        const response = await axios.post(
            '/removeUserFromGroup',
            { memberId, groupId },
            { headers: { "Authorization": token } }
        );

        if (response.status === 200) {
            li.remove();
            console.log(response.data.message);
            alert('User removed from the group successfully.');
        } else {
            console.error('Error removing user from group:', response.data.error);
            alert('Failed to remove user from the group. Please try again.');
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }
}


async function allGroupMember(){
    const res=await axios.get(`/getGroupUser/${groupId}`,{ headers: { "Authorization": token } })
    console.log(res.data,"allGroupMember")
    groupMember=res.data.users
    console.log(groupMember);
    const memberList=document.getElementById("memberList")
    memberList.innerHTML=''
    memberList.innerHTML+='<h3>Group Members</h3>'
    groupMember.forEach(member => {
        const li=document.createElement("li")
        li.appendChild(document.createTextNode(`${member.name}`))

        let removeBtn=document.createElement('button')
        removeBtn.className="btn btn-outline-danger btn-sm "
        removeBtn.appendChild(document.createTextNode("Remove"))
        li.appendChild(removeBtn)

        removeBtn.addEventListener('click',()=>removeUserFromGroup(member.id,li,groupId))


        let adminBtn=document.createElement("button")
        adminBtn.className="btn btn-outline-info btn-sm"
        adminBtn.appendChild(document.createTextNode("Admin"))
        li.appendChild(adminBtn)

        adminBtn.addEventListener('click',()=>makeNewAdmin(member.id))
        
        memberList.appendChild(li)
    });
    
            let addMemberBtn=document.createElement('button')
            addMemberBtn.className="btn btn-outline-secondary ntn-sm"
            addMemberBtn.appendChild(document.createTextNode('Add members'))
            memberList.appendChild(addMemberBtn)
            addMemberBtn.addEventListener('click',async()=>{
                addMember()
            })
}

async function addMember() {
    try {
        // Fetch all users from the server
        const usersResponse = await axios.get('/getAllUsers', { headers: { "Authorization": token } });
        const allUsers = usersResponse.data.users;

        // Get the user list container
        const userListContainer = document.getElementById('userList');
        userListContainer.innerHTML = '';

        // Create checkboxes for each user
        allUsers.forEach(user => {
            const userContainer = document.createElement('div');
            userContainer.className = 'userContainer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'userCheckbox';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.appendChild(document.createTextNode(user.name));
            label.appendChild(checkbox);

            userListContainer.appendChild(label);
            userListContainer.appendChild(userContainer);
        });

        // Show the user selection popup
        const userSelectionPopup = document.getElementById('userSelectionPopup');
        userSelectionPopup.style.display = 'block';

        // Event listener for the "Add to Group" button
        const addUserToGroupButton = document.getElementById('addUsersToGroup');
        addUserToGroupButton.addEventListener('click', async () => {
            // Get the selected user IDs
            const selectedUserIds = Array.from(document.querySelectorAll('input[name=userCheckbox]:checked'))
                .map(checkbox => checkbox.value);

            // Close the user selection popup
            userSelectionPopup.style.display = 'none';

            // Add the selected users to the group
            await addUsersToGroup(groupId, selectedUserIds);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to add users to the group
async function addUsersToGroup(groupId, selectedUserIds) {
    try {
        // Use the selectedUserIds to add users to the group
        const response = await axios.post('/addNewGroupMembers', { groupId, members: selectedUserIds }, { headers: { "Authorization": token } });

        if (response.status === 200) {
            // Users added to the existing group successfully
            fetchGroupsData();
        }
    } catch (error) {
        console.error('Error adding users to the group:', error);
    }
}

async function makeNewAdmin(memberId) {
    try {
        console.log(memberId, "makeAdmin");

        const response = await axios.post(
            'makeUserAdmin',
            { memberId, groupId },
            { headers: { "Authorization": token } }
        );

        console.log(response.data); 
        alert('User has been made an admin successfully.'); 
    } catch (error) {
        console.error('Error making user admin:', error);
        alert('An error occurred while making the user an admin.'); 
    }
}


        fetchGroupsData();
        // fetchChatData()