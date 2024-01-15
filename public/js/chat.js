const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');



let groupId
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

   const fetchChatData = async () => {
            try {
                
                // Retrieve messages from local storage
                const localMessages = getMessagesFromLocal();
                console.log(localMessages);
                

                // Fetch new messages from the backend since the latest local message
                const latestLocalMessageTimestamp = getLatestLocalMessageTimestampForGroup(localMessages, groupId);
                const response = await axios.get('getChatData', { headers: { "Authorization": token, "Latest-Local-Timestamp": latestLocalMessageTimestamp } });

                // Combine local and new messages
                const allMessages = [...localMessages, ...response.data.chat];

                // Save all messages to local storage
                saveMessagesToLocal(allMessages);

                // Update the chatBox with all messages
                chatBox.innerHTML = '';
                allMessages.forEach(msg => {
                    const sender = msg.userId === userId ? 'You' : msg.user.name;
                    const messageClass = msg.userId === userId ? 'userMessage' : 'otherMessage';
                    const messageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> ${msg.message}</p>`;
                    if (msg.groupId === groupId) {
                const messageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> ${msg.message}</p>`;
                chatBox.innerHTML += messageHTML;
            } 
            // else if(!msg.groupId){
            //     chatBox.innerHTML = `<h3 style="color: red;">hello ${msg.user.name} join a group to start the conversation</h3>`;
            // }              
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
        const getLatestLocalMessageTimestampForGroup = (messages,currentGroupId) => {
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

        // Call the fetchChatData function on page load
        fetchChatData();

        // Event listener for submitting messages
    messageForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();

            if (message === '') {
                return; // Don't send empty messages
            }

            try {
                // Send new message to the backend
                // const groupId = getCurrentGroupId // Implement a function to get the current group ID
                const res = await axios.post('/postChat', { message, groupId }, { headers: { "Authorization": token } });
                if (res.status === 201) {
                    console.log(res.data, "data..............");
                    // Fetch updated chat data after sending the message
                    fetchChatData(groupId);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
            messageInput.value = '';
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
        console.log(allUsers+"allUsers");

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
              // Use the selectedUserIds to create a new group
              try {
                const groupName = prompt('Enter group name:'); // Prompt for the group name (you can replace it with your UI logic)
                if (groupName) {
                    // Send a request to create a group and add users to it
                    const response = await axios.post('/createGroup', { groupName, members: selectedUserIds }, { headers: { "Authorization": token } });

                    if (response.status === 201) {
                        // Group created successfully, you can fetch and display groups
                        fetchGroupsData();
                    }
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
         /* extract group ID from the clicked button or use any other logic */
        // Fetch and display chat data for the clicked group
        fetchChatDataForGroup(currentGroupId);
    }
});

// Function to fetch updated groups data
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
        const response = await axios.get(`/getChatData/${groupId}`, { headers: { "Authorization": token } });
        const groupChat = response.data.chat;
        console.log(response, ".......fetchChatDataForGroup");
        console.log(groupChat, "....groupChat");

        // Fetch all users
        const usersResponse = await axios.get('/getAllUsers', { headers: { "Authorization": token } });
        const users = usersResponse.data.users;

        // Update the chat box with group chat data
        const chatBox = document.getElementById('chatBox');
        chatBox.innerHTML = '';

        groupChat.forEach(msg => {
            const user = users.find(user => user.id === msg.userId);
            const sender = msg.userId === userId ? 'You' : (user?.name || 'Unknown User');
            const messageClass = msg.userId === userId ? 'userMessage' : 'otherMessage';
            const messageHTML = `<p class="message ${messageClass}"><strong>${sender}:</strong> ${msg.message}</p>`;
            chatBox.innerHTML += messageHTML;
        });

        // Scroll to the bottom of the chatBox to show the latest messages
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error fetching group chat data:', error);
    }
};

        fetchGroupsData();