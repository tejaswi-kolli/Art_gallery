import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../api/api';
import '../styles/Community.css';

const socket = io.connect('http://localhost:5000');

const Community = () => {
    const [activeTab, setActiveTab] = useState('chat'); // chat, global, collaboration, resources

    // Chat State
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // Global Chat State
    const [globalMessages, setGlobalMessages] = useState([]);

    // Posts State
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);

    // Auto-scroll Ref
    const chatMessagesRef = React.useRef(null);

    const scrollToBottom = () => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    };

    React.useLayoutEffect(() => {
        scrollToBottom();
    }, [messages, globalMessages]);

    useEffect(() => {
        // Init User
        const userStr = localStorage.getItem('user');
        let user = null;
        if (userStr) {
            user = JSON.parse(userStr);
        } else {
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) user = JSON.parse(userInfoStr);
        }

        console.log("Current User in Community:", user);
        setCurrentUser(user);

        // Fetch Contacts
        if (activeTab === 'chat') {
            fetchContacts();
        }
    }, [activeTab]);

    useEffect(() => {
        if (currentUser) {
            socket.emit('setup_socket', currentUser._id);
        }
    }, [currentUser]);

    // Global Chat Room Join & Fetch History
    useEffect(() => {
        if (activeTab === 'global' && currentUser && currentUser.role === 'artist') {
            console.log("Joining Global Artist Room");
            socket.emit('join_room', 'artist_global');

            // Fetch History
            const fetchHistory = async () => {
                try {
                    const { data } = await api.get('/chat/global/history');
                    // Map backend format to UI format if needed
                    const formatted = data.map(msg => ({
                        author: msg.authorName,
                        senderId: msg.senderId,
                        message: msg.message,
                        time: msg.timestamp || new Date(msg.createdAt).toLocaleTimeString(),
                        room: 'artist_global'
                    }));
                    setGlobalMessages(formatted);
                } catch (error) {
                    console.error("Failed to fetch global history", error);
                }
            };
            fetchHistory();
        }
    }, [activeTab, currentUser]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            console.log("Received Message:", data);

            // Handle Global Chat
            if (data.room === 'artist_global') {
                setGlobalMessages(prev => [...prev, data]);
                return;
            }

            setSelectedContact((currentSelected) => {
                const isCurrentChat = currentSelected &&
                    (data.senderId === currentSelected._id || data.receiverId === currentSelected._id);

                if (isCurrentChat) {
                    setMessages((prev) => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.senderId === data.senderId && lastMsg.message === data.message && lastMsg.time === data.time) {
                            return prev;
                        }
                        return [...prev, data];
                    });
                }

                setContacts((prevContacts) => {
                    let newContacts = [...prevContacts];
                    const contactIndex = newContacts.findIndex(c => c._id === data.senderId || c._id === data.receiverId);

                    if (contactIndex !== -1) {
                        const contact = newContacts[contactIndex];
                        if (contact.lastMessage === data.message && contact.lastTime === data.time) {
                            return prevContacts;
                        }

                        contact.lastMessage = data.message;
                        contact.lastTime = data.time;

                        if (!isCurrentChat && currentUser && data.senderId !== currentUser._id) {
                            contact.unread = (contact.unread || 0) + 1;
                        }

                        newContacts.splice(contactIndex, 1);
                        newContacts.unshift(contact);
                    } else {
                        if (currentUser && data.senderId !== currentUser._id) {
                            const exists = prevContacts.find(c => c._id === data.senderId);
                            if (!exists) {
                                const newContact = {
                                    _id: data.senderId,
                                    name: data.author,
                                    role: 'artist',
                                    lastMessage: data.message,
                                    lastTime: data.time,
                                    unread: 1
                                };
                                newContacts.unshift(newContact);
                            }
                        }
                    }
                    return newContacts;
                });
                return currentSelected;
            });
        };

        socket.on('receive_message', handleReceiveMessage);
        return () => socket.off('receive_message', handleReceiveMessage);
    }, [currentUser]);

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/chat/contacts');
            setContacts(data);
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        }
    };

    const selectContact = async (contact) => {
        if (!currentUser || !contact) return;

        setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, unread: 0 } : c));
        setSelectedContact(contact);
        setMessages([]);

        const userId = String(currentUser._id);
        const contactId = String(contact._id);
        const roomName = [userId, contactId].sort().join('_');

        socket.emit('join_room', roomName);

        try {
            const { data } = await api.get(`/chat/${contact._id}`);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedContact || !currentUser) return;

        const roomName = [String(currentUser._id), String(selectedContact._id)].sort().join('_');
        const msgData = {
            room: roomName,
            author: currentUser.name,
            senderId: currentUser._id,
            receiverId: selectedContact._id,
            message: newMessage,
            time: new Date().toLocaleTimeString()
        };

        await socket.emit('send_message', msgData);

        try {
            await api.post('/chat/send', {
                receiverId: selectedContact._id,
                message: newMessage,
                room: roomName
            });
        } catch (err) {
            console.error("Failed to save message", err);
        }

        setMessages((prev) => [...prev, msgData]);

        setContacts((prevContacts) => {
            let newContacts = [...prevContacts];
            const contactIndex = newContacts.findIndex(c => c._id === selectedContact._id);

            if (contactIndex !== -1) {
                const contact = newContacts[contactIndex];
                contact.lastMessage = newMessage;
                contact.lastTime = msgData.time;
                newContacts.splice(contactIndex, 1);
                newContacts.unshift(contact);
            }
            return newContacts;
        });

        setNewMessage('');
    };


    const sendGlobalMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;

        const msgData = {
            room: 'artist_global',
            author: currentUser.name,
            senderId: currentUser._id,
            message: newMessage,
            time: new Date().toLocaleTimeString()
        };

        // 1. Emit via Socket (for real-time updates to others)
        await socket.emit('send_message', msgData);

        // 2. Save to DB
        try {
            await api.post('/chat/global', {
                message: newMessage,
                time: msgData.time
            });
        } catch (err) {
            console.error("Failed to save global message", err);
        }

        // 3. Update local UI immediately
        setGlobalMessages(prev => [...prev, msgData]);
        setNewMessage('');
    };

    const fetchPosts = async (type) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/community/posts/${type}`);
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [newPostImage, setNewPostImage] = useState(null);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const type = activeTab === 'resources' ? 'tip' : 'collaboration';

        const formData = new FormData();
        formData.append('type', type);
        formData.append('title', newPost.title);
        formData.append('content', newPost.content);
        if (newPostImage) {
            formData.append('image', newPostImage);
        }

        try {
            await api.post('/community/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewPost({ title: '', content: '' });
            setNewPostImage(null);
            fetchPosts(type);
        } catch (error) {
            alert('Failed to create post');
        }
    };

    const handleConnect = async (authorId, authorName) => {
        if (!currentUser || authorId === currentUser._id) return;

        // Optimistically switch to chat
        setActiveTab('chat');

        // Check if contact exists
        const existingContact = contacts.find(c => c._id === authorId);
        if (existingContact) {
            selectContact(existingContact);
        } else {
            // Create temp contact object to start chat
            const newContact = { _id: authorId, name: authorName, role: 'artist' };
            setContacts(prev => [newContact, ...prev]);
            selectContact(newContact);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await api.delete(`/community/posts/${postId}`);
            // Refresh posts after deletion
            const type = activeTab === 'resources' ? 'tip' : 'collaboration';
            fetchPosts(type);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete post');
        }
    };

    React.useEffect(() => {
        if (activeTab === 'collaboration' || activeTab === 'resources') {
            const type = activeTab === 'resources' ? 'tip' : 'collaboration';
            fetchPosts(type);
        }
    }, [activeTab]);

    return (
        <div className="community-page">
            <div className="community-header">
                <h1>Community Hub</h1>
                <p>Connect, Collaborate, and Grow</p>
            </div>

            <div className="community-tabs">
                <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>Messages</button>

                {currentUser && currentUser.role === 'artist' && (
                    <>
                        <button className={activeTab === 'collaboration' ? 'active' : ''} onClick={() => setActiveTab('collaboration')}>Collaborations</button>
                        <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>Resources</button>
                        <button className={activeTab === 'marketing' ? 'active' : ''} onClick={() => setActiveTab('marketing')}>Marketing Guide</button>
                    </>
                )}
            </div>

            <div className="community-content">
                {activeTab === 'chat' && (
                    <div className="chat-layout">
                        <div className="contacts-sidebar">
                            <h3>Contacts</h3>
                            {contacts.length === 0 ? <p className="no-contacts">No contacts yet.</p> : (
                                <ul>
                                    {contacts.map(c => (
                                        <li key={c._id} className={selectedContact && selectedContact._id === c._id ? 'active' : ''} onClick={() => selectContact(c)}>
                                            <div className="contact-meta">
                                                <span className="contact-name">{c.name}</span>
                                                {c.unread > 0 && <span className="unread-count">{c.unread}</span>}
                                            </div>
                                            <div className="contact-details">
                                                <span className="contact-role">{c.role}</span>
                                                <span className="last-message">{c.lastMessage}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="chat-window-main">
                            {selectedContact ? (
                                <>
                                    <div className="chat-window-header"><h4>{selectedContact.name}</h4></div>
                                    <div className="chat-messages-area" ref={chatMessagesRef}>
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`message ${msg.senderId === currentUser?._id ? 'me' : 'other'}`}>
                                                <div className="message-bubble">{msg.message}</div>
                                                <div className="message-meta">{msg.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="chat-input-area">
                                        <input
                                            type="text"
                                            placeholder="Type..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            autoFocus
                                        />
                                        <button onClick={sendMessage}>Send</button>
                                    </div>
                                </>
                            ) : (<div className="chat-placeholder"><p>Select a contact to start messaging</p></div>)}
                        </div>
                    </div>
                )}

                {activeTab === 'global' && currentUser && currentUser.role === 'artist' && (
                    <div className="chat-layout" style={{ justifyContent: 'center' }}>
                        <div className="chat-window-main" style={{ width: '80%', maxWidth: '800px', border: '1px solid #ddd' }}>
                            <div className="chat-window-header"><h4>Global Artist Community</h4></div>
                            <div className="chat-messages-area" ref={chatMessagesRef}>
                                {globalMessages.map((msg, idx) => (
                                    <div key={idx} className={`message ${msg.senderId === currentUser?._id ? 'me' : 'other'}`}>
                                        <div className="message-bubble">
                                            {msg.senderId !== currentUser?._id && <strong style={{ display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>{msg.author}</strong>}
                                            {msg.message}
                                        </div>
                                        <div className="message-meta">{msg.time}</div>
                                    </div>
                                ))}
                                {globalMessages.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Welcome to the Global Artist Chat! Say hello to your peers.</p>}
                            </div>
                            <div className="chat-input-area">
                                <input type="text" placeholder="Type a message to everyone..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendGlobalMessage()} />
                                <button onClick={sendGlobalMessage}>Send</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'marketing' && (
                    <div className="marketing-section">
                        <h2>Artist Marketing & Promotion Guide</h2>
                        <div className="marketing-grid">
                            <div className="marketing-card">
                                <h3>Social Media Strategy</h3>
                                <p>Consistency is key. Post high-quality images of your work, behind-the-scenes process videos, and artist statements. Use platforms like Instagram and Pinterest which are visual-first.</p>
                                <ul>
                                    <li>Post at least 3 times a week.</li>
                                    <li>Use relevant hashtags (#art, #contemporaryart).</li>
                                    <li>Engage with commenters immediately.</li>
                                </ul>
                            </div>
                            <div className="marketing-card">
                                <h3>Pricing Your Art</h3>
                                <p>Don't undervalue your work. Consider materials, time, and market demand. A common formula: (Hourly Wage × Hours Spent) + Cost of Materials × 2.</p>
                            </div>
                            <div className="marketing-card">
                                <h3>Building a Brand</h3>
                                <p>Your personal brand tells your story. Define your unique style not just in your art, but in how you present yourself online. Have a consistent color palette and tone of voice.</p>
                            </div>
                            <div className="marketing-card">
                                <h3>Networking</h3>
                                <p>Collaborate with other artists! Use the "Collaborations" tab here to find partners for joint exhibitions or cross-promotion.</p>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'collaboration' || activeTab === 'resources') && (
                    <div className="posts-container">
                        <div className="create-post-section">
                            <h3>{activeTab === 'collaboration' ? 'Post a Request' : 'Share a Resource'}</h3>
                            <form onSubmit={handleCreatePost} className="post-form">
                                <input type="text" placeholder="Title" required value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                                <textarea placeholder="Details..." required value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}></textarea>
                                {activeTab === 'resources' && (
                                    <input type="file" onChange={(e) => setNewPostImage(e.target.files[0])} accept="image/*" />
                                )}
                                <button type="submit" className="btn-sm">Post</button>
                            </form>
                        </div>
                        <div className="posts-list">
                            {loading ? <p>Loading...</p> : posts.map(post => (
                                <div key={post._id} className="post-card">
                                    <div className="post-header">
                                        <h4>{post.title}</h4>
                                        <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="post-content">{post.content}</p>
                                    {post.image && (
                                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                            <img src={`http://localhost:5000/${post.image}`} alt="Resource" style={{ maxWidth: '200px', borderRadius: '8px', maxHeight: '150px', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div className="post-footer">
                                        <span className="post-author">By {post.author?.name || 'Unknown'}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {post.author && post.author._id !== currentUser?._id && (
                                                <button className="btn-connect" onClick={() => handleConnect(post.author._id, post.author.name)}>
                                                    Connect
                                                </button>
                                            )}
                                            {post.author && post.author._id === currentUser?._id && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeletePost(post._id)}
                                                    style={{
                                                        background: '#dc3545',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {posts.length === 0 && <p>No posts yet. Be the first!</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
