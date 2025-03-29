document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const messagesContainer = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    const chatHistoryButton = document.getElementById('chat-history-button');
    const chatHistoryPanel = document.getElementById('chat-history-panel');
    
    // Global variables
    let isProcessing = false;
    let currentChatId = null;
    let chatHistory = [];

    // Load chat history from localStorage
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('sbaChatHistory');
        if (savedHistory) {
            try {
                chatHistory = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error parsing chat history:', e);
                chatHistory = [];
            }
        }
    }

    // Save chat history to localStorage
    function saveChatHistory() {
        try {
            localStorage.setItem('sbaChatHistory', JSON.stringify(chatHistory));
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }

    // Generate a new chat ID
    function generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Initialize a new chat session
    function initNewChat() {
        currentChatId = generateChatId();
        const timestamp = new Date();
        
        chatHistory.unshift({
            id: currentChatId,
            title: 'New Conversation',
            timestamp: timestamp.toISOString(),
            formattedDate: formatDate(timestamp),
            messages: []
        });
        
        // Limit history to 20 conversations
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(0, 20);
        }
        
        saveChatHistory();
        updateChatHistoryPanel();
    }

    // Format a date for display
    function formatDate(date) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        
        if (date.toDateString() === now.toDateString()) {
            return 'Today at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    // Update the title of the current chat
    function updateChatTitle(chatId, newTitle) {
        const chatIndex = chatHistory.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
            chatHistory[chatIndex].title = newTitle;
            saveChatHistory();
            updateChatHistoryPanel();
        }
    }

    // Add a message to the current chat history
    function addMessageToHistory(role, content, sources = []) {
        if (!currentChatId) {
            initNewChat();
        }
        
        const chatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);
        if (chatIndex !== -1) {
            chatHistory[chatIndex].messages.push({
                role,
                content,
                sources,
                timestamp: new Date().toISOString()
            });
            
            // If this is the first user message, use it as the chat title
            if (role === 'user' && chatHistory[chatIndex].messages.length === 1) {
                const title = content.length > 30 ? content.substring(0, 27) + '...' : content;
                chatHistory[chatIndex].title = title;
            }
            
            saveChatHistory();
            updateChatHistoryPanel();
        }
    }

    // Render the chat history panel
    function updateChatHistoryPanel() {
        if (!chatHistoryPanel) return;
        
        chatHistoryPanel.innerHTML = '';
        
        if (chatHistory.length === 0) {
            chatHistoryPanel.innerHTML = '<div class="history-empty">No previous conversations</div>';
            return;
        }
        
        chatHistory.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'history-item';
            if (chat.id === currentChatId) {
                chatElement.classList.add('active');
            }
            
            chatElement.innerHTML = `
                <div class="history-title">${escapeHTML(chat.title)}</div>
                <div class="history-date">${chat.formattedDate}</div>
                <button class="history-delete" title="Delete conversation" data-chat-id="${chat.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            `;
            
            chatElement.addEventListener('click', (e) => {
                if (!e.target.closest('.history-delete')) {
                    loadChat(chat.id);
                }
            });
            
            chatHistoryPanel.appendChild(chatElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.history-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = button.getAttribute('data-chat-id');
                deleteChat(chatId);
            });
        });
    }

    // Load a specific chat
    function loadChat(chatId) {
        const chatIndex = chatHistory.findIndex(chat => chat.id === chatId);
        if (chatIndex === -1) return;
        
        currentChatId = chatId;
        
        // Clear the messages container
        messagesContainer.innerHTML = '';
        
        // Add welcome message
        if (chatIndex !== -1 && chatHistory[chatIndex].messages.length > 0) {
            // Render all messages in this chat
            chatHistory[chatIndex].messages.forEach(msg => {
                if (msg.role === 'user') {
                    addUserMessageToUI(msg.content);
                } else if (msg.role === 'assistant') {
                    addAssistantMessageToUI(msg.content, msg.sources);
                }
            });
        } else {
            // Add the welcome message if this is a new chat
            addWelcomeMessage();
        }
        
        // Update the chat history panel
        updateChatHistoryPanel();
        
        // Close the history panel if on mobile
        if (window.innerWidth < 768) {
            toggleChatHistoryPanel(false);
        }
    }

    // Delete a chat
    function deleteChat(chatId) {
        const chatIndex = chatHistory.findIndex(chat => chat.id === chatId);
        if (chatIndex === -1) return;
        
        chatHistory.splice(chatIndex, 1);
        saveChatHistory();
        
        // If we deleted the current chat, load another one or start a new one
        if (chatId === currentChatId) {
            if (chatHistory.length > 0) {
                loadChat(chatHistory[0].id);
            } else {
                initNewChat();
                messagesContainer.innerHTML = '';
                addWelcomeMessage();
            }
        }
        
        updateChatHistoryPanel();
    }

    // Toggle the chat history panel
    function toggleChatHistoryPanel(show) {
        if (!chatHistoryPanel) return;
        
        if (show === undefined) {
            chatHistoryPanel.classList.toggle('open');
        } else {
            if (show) {
                chatHistoryPanel.classList.add('open');
            } else {
                chatHistoryPanel.classList.remove('open');
            }
        }
    }

    // Check if in embed mode (when used in an iframe)
    if (window.location.href.includes('?embed=true')) {
        document.querySelector('.chat-container').classList.add('embed-mode');
    }

    // API configuration
    const API_URL = 'PASTE_YOUR_API_GATEWAY_URL_HERE';  // Replace this with the API Gateway URL you received
    const API_KEY = '';  // Add your API key if needed

    // Initialize by loading chat history and resizing the input
    loadChatHistory();
    
    // If we have chat history, load the most recent chat
    if (chatHistory.length > 0) {
        loadChat(chatHistory[0].id);
    } else {
        // Otherwise initialize a new chat
        initNewChat();
    }
    
    // Set up the chat history button event
    if (chatHistoryButton) {
        chatHistoryButton.addEventListener('click', () => {
            toggleChatHistoryPanel();
        });
    }
    
    // Initialize by resizing the input
    resizeTextarea();

    // Add the welcome message
    function addWelcomeMessage() {
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'message assistant';
        welcomeElement.innerHTML = `
            <div class="avatar">
                <img src="logo.png" alt="Assistant">
            </div>
            <div class="content">
                <p>Hello! I'm your SBA loan assistant. I can help answer questions about SBA Standard Operating Procedures, guidelines, and requirements.</p>
                <p>What would you like to know about SBA loans?</p>
            </div>
        `;
        messagesContainer.appendChild(welcomeElement);
        scrollToBottom();
    }

    // Create a user avatar
    function createUserAvatar() {
        return `
            <div class="avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        `;
    }

    // Add a user message to the UI only (no storage)
    function addUserMessageToUI(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.innerHTML = `
            ${createUserAvatar()}
            <div class="content">
                <p>${escapeHTML(text)}</p>
            </div>
        `;
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    // Add a user message to the chat and store in history
    function addUserMessage(text) {
        addUserMessageToUI(text);
        addMessageToHistory('user', text);
    }

    // Add an assistant message to the UI only (no storage)
    function addAssistantMessageToUI(text, sources = []) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message assistant';
        
        // Convert markdown links and formatting
        const formattedText = formatMarkdown(text);
        
        let sourcesHTML = '';
        if (sources && sources.length > 0) {
            sourcesHTML = `
                <div class="sources">
                    <strong>Sources:</strong>
                    ${sources.map(source => `
                        <div class="source-item">
                            <span class="source-badge">SOP</span>
                            <span class="source-text">${escapeHTML(source.citation)} in ${escapeHTML(source.source)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        messageElement.innerHTML = `
            <div class="avatar">
                <img src="logo.png" alt="Assistant">
            </div>
            <div class="content">
                ${formattedText}
                ${sourcesHTML}
            </div>
        `;
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    // Add an assistant message to the chat with typing effect and store in history
    function addAssistantMessage(text, sources = []) {
        // First add a typing indicator
        const typingIndicator = addTypingIndicator();
        
        // Simulate typing effect
        setTimeout(() => {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add message to UI
            addAssistantMessageToUI(text, sources);
            
            // Store in history
            addMessageToHistory('assistant', text, sources);
        }, 500);
    }

    // Add a typing indicator
    function addTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message assistant';
        typingElement.innerHTML = `
            <div class="avatar">
                <img src="logo.png" alt="Assistant">
            </div>
            <div class="content">
                <p>
                    Thinking
                    <span class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </p>
            </div>
        `;
        messagesContainer.appendChild(typingElement);
        scrollToBottom();
        return typingElement;
    }

    // Format markdown-like text
    function formatMarkdown(text) {
        // Convert paragraphs
        let formatted = text.split('\n\n').map(para => `<p>${para}</p>`).join('');
        
        // Convert bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert links
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return formatted;
    }

    // Escape HTML special characters
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Scroll to the bottom of the messages container
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Auto-resize the textarea
    function resizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    }

    // Send a message to the API
    async function sendMessageToAPI(message) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
                },
                body: JSON.stringify({
                    question: message,
                    top_k: 5
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            // For demo purposes, if API is not connected, return a mock response
            if (!data) {
                return mockAPIResponse(message);
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            // Return mock data for demo
            return mockAPIResponse(message);
        }
    }

    // Mock API response for demo or if API is not available
    function mockAPIResponse(message) {
        const responses = [
            {
                answer: "SBA loan eligibility generally requires your business to be for-profit, operating in the US, have invested equity, and have exhausted other financing options. The specific requirements may vary depending on the loan program you're applying for.",
                sources: [
                    { 
                        citation: "Chapter 2.A on page 104", 
                        source: "SOP 50 10 6" 
                    },
                    { 
                        citation: "Chapter 3.B.2 on page 127", 
                        source: "SOP 50 10 6" 
                    }
                ]
            },
            {
                answer: "The SBA 7(a) loan program is the SBA's primary program for providing financial assistance to small businesses. The maximum loan amount is $5 million with terms up to 25 years for real estate and 10 years for equipment and working capital.",
                sources: [
                    { 
                        citation: "Section A.1 on page 8", 
                        source: "SOP 50 10 6" 
                    }
                ]
            },
            {
                answer: "For SBA 504 loans, the typical structure is 10% down from the borrower, 40% from the CDC/SBA, and 50% from a conventional lender. The maximum SBA debenture is generally $5 million but can be up to $5.5 million for small manufacturing businesses or energy projects.",
                sources: [
                    { 
                        citation: "Chapter 4.C on page 230", 
                        source: "SOP 50 10 6" 
                    },
                    { 
                        citation: "Section D.2.a on page 245", 
                        source: "SOP 50 10 6" 
                    }
                ]
            }
        ];
        
        // Return a random mock response
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Form submission handler
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message || isProcessing) return;
        
        // Reset input and set processing flag
        messageInput.value = '';
        resizeTextarea();
        isProcessing = true;
        
        // Disable the send button
        sendButton.disabled = true;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Send to API and get response
        const response = await sendMessageToAPI(message);
        
        // Process API response
        addAssistantMessage(response.answer, response.sources);
        
        // Re-enable input
        isProcessing = false;
        sendButton.disabled = false;
        messageInput.focus();
    });
    
    // Clear chat handler updated to handle history
    clearChatButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear this conversation?')) {
            // Start a new chat
            initNewChat();
            
            // Clear the UI
            messagesContainer.innerHTML = '';
            addWelcomeMessage();
            
            // Focus the input
            messageInput.focus();
        }
    });

    // Textarea input handler for auto-resizing
    messageInput.addEventListener('input', resizeTextarea);

    // Clear chat handler
    clearChatButton.addEventListener('click', function() {
        // Keep only the first message (welcome message)
        const firstMessage = messagesContainer.firstElementChild;
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(firstMessage);
    });

    // Focus the input on page load
    messageInput.focus();
});

// Webflow embed code initialization
window.addEventListener('message', function(event) {
    // Listen for height adjustment messages
    if (event.data && event.data.type === 'resize') {
        const height = event.data.height;
        document.documentElement.style.height = height + 'px';
        document.body.style.height = height + 'px';
    }
});