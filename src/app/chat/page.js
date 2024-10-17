
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function Chat() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user's groups
        async function fetchGroups() {
            const res = await fetch('/api/group/list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setGroups(data);
            // setSelectedGroup(data[0].id); // Select first group by default
        }
        fetchGroups();
    }, [router]);

    useEffect(() => {
        if (selectedGroup) {
            // Fetch messages for the selected group
            async function fetchMessages() {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/group/${selectedGroup}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setMessages(data);
            }
            fetchMessages();
        }
    }, [selectedGroup]);

    useEffect(() => {

        socket.on('newMessage', (newMessage) => {
            if (newMessage.groupId == selectedGroup) {
                setMessages((prevMessages) => {
                    const messageExists = prevMessages.some(
                        (msg) => msg.id == newMessage.id
                    );
                    // Only add the message if it's not already in the list
                    if (!messageExists) {
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages; // No change if the message exists
                });
            }
        });

        return () => {
            socket.off('newMessage'); // Cleanup on unmount
        };
    }, [selectedGroup, messages]);

    const sendMessage = async () => {
        try {
            if (message.trim()) {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/group/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ text: message, groupId: selectedGroup }),
                });

                const data = await res.json();

                if (res.ok) {

                    setMessage('');
                    setMessages([...messages, data]);
                   // socket.emit('newMessage', data);
                    socket.emit('sendMessage', data);
                } else {
                    console.error(data.error);
                }
            }
        }catch (err) {
            console.log(err)
        }
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <div>
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="mb-4 p-2 border"
                >
                    {groups?.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex-grow overflow-y-scroll">
                {messages?.map((msg, idx) => (
                    <p key={idx} className="my-2 p-2 bg-gray-200 rounded">
                        <strong>{msg?.user?.username}:</strong> {msg.text}
                    </p>
                ))}
            </div>

            <div className="mt-4 flex">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow border p-2 rounded-l"
                    placeholder="Type your message..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
