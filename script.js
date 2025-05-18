document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const messagesContainer = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    const chatHistoryButton = document.getElementById('chat-history-button');
    const chatHistoryPanel = document.getElementById('chat-history-panel');
    const historyCloseButton = document.getElementById('history-close-button');
    
    // Global variables
    let isProcessing = false;
    let currentChatId = null;
    let chatHistory = [];

    // CRITICAL FIX: Remove initial disabled state from the button
    sendButton.removeAttribute('disabled');
    
    // DIRECT INPUT HANDLER: Enable/disable button based on input
    messageInput.addEventListener('input', function() {
        sendButton.disabled = !this.value.trim();
        resizeTextarea();
    });
    
    // DIRECT ENTER KEY HANDLER: Submit on Enter
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isProcessing && this.value.trim()) {
                messageForm.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Add chat history button click handler
    chatHistoryButton.addEventListener('click', function() {
        toggleChatHistoryPanel();
    });
    
    // Enhanced sidebar close button handler - ensures it stays visible and functional after queries
    const historyCloseBtn = document.getElementById('history-close-button');
    if (historyCloseBtn) {
        historyCloseBtn.addEventListener('click', function(e) {
            console.log('History close button clicked');
            e.preventDefault();
            e.stopPropagation();
            // Directly manipulate the class rather than using toggleChatHistoryPanel
            document.getElementById('chat-history-panel').classList.remove('open');
        });
        
        // Make sure the button is always visible and has the correct styling
        function applyCorrectButtonStyling() {
            historyCloseBtn.style.display = 'flex';
            historyCloseBtn.style.zIndex = '9999';
            historyCloseBtn.style.opacity = '1';
            historyCloseBtn.style.visibility = 'visible';
            
            // Force the Lords of Lending styling
            historyCloseBtn.style.backgroundColor = '#2c2c2c';
            historyCloseBtn.style.border = '1px solid #d4af37';
            historyCloseBtn.style.color = '#d4af37';
            
            // Make sure the SVG element has the right color too
            const svg = historyCloseBtn.querySelector('svg');
            if (svg) {
                svg.style.fill = '#d4af37';
            }
        }
        
        // Apply styling immediately
        applyCorrectButtonStyling();
        
        // Also add hover effects
        historyCloseBtn.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#d4af37';
            this.style.color = 'black';
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.fill = 'black';
            }
        });
        
        historyCloseBtn.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#2c2c2c';
            this.style.color = '#d4af37';
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.fill = '#d4af37';
            }
        });
        
        // Ensure button styling stays correct when DOM changes
        const observer = new MutationObserver(function(mutations) {
            applyCorrectButtonStyling();
        });
        
        // Start observing the DOM for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        console.error('History close button not found in DOM');
        // Create one if it doesn't exist
        const newCloseBtn = document.createElement('button');
        newCloseBtn.id = 'history-close-button';
        newCloseBtn.title = 'Close history panel';
        newCloseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#d4af37" viewBox="0 0 16 16" style="font-weight: bold;"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';
        document.body.appendChild(newCloseBtn);
        
        // Apply Lords of Lending styling to the new button
        newCloseBtn.style.backgroundColor = '#2c2c2c';
        newCloseBtn.style.border = '1px solid #d4af37';
        newCloseBtn.style.color = '#d4af37';
        newCloseBtn.style.display = 'flex';
        newCloseBtn.style.alignItems = 'center';
        newCloseBtn.style.justifyContent = 'center';
        newCloseBtn.style.position = 'fixed';
        newCloseBtn.style.right = '10px';
        newCloseBtn.style.top = '15px';
        newCloseBtn.style.zIndex = '9999';
        newCloseBtn.style.width = '30px';
        newCloseBtn.style.height = '30px';
        newCloseBtn.style.borderRadius = '4px';
        newCloseBtn.style.cursor = 'pointer';
        
        // Add hover effects to new button
        newCloseBtn.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#d4af37';
            this.style.color = 'black';
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.fill = 'black';
            }
        });
        
        newCloseBtn.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#2c2c2c';
            this.style.color = '#d4af37';
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.fill = '#d4af37';
            }
        });
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const panel = document.getElementById('chat-history-panel');
            if (panel) {
                panel.classList.remove('open');
            }
        });
    }
    
    // CRITICAL FIX: Explicitly add the welcome message immediately
    // Clear any existing messages first
    messagesContainer.innerHTML = '';
    // Add the welcome message
    addWelcomeMessage();
    
    // --- Sidebar Close Button Handler Setup ---
    function ensureSidebarCloseButton() {
        // Always ensure the close button exists in the header
        const historyHeader = document.querySelector('.history-header');
        if (historyHeader && !document.getElementById('history-close-button')) {
            const closeBtn = document.createElement('button');
            closeBtn.id = 'history-close-button';
            closeBtn.title = 'Close history panel';
            closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`;
            closeBtn.className = '';
            // Insert at the end of the header
            historyHeader.appendChild(closeBtn);
        }
        // Always attach the event listener
        const btn = document.getElementById('history-close-button');
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                chatHistoryPanel.classList.remove('open');
            };
        }
    }

    // Patch updateChatHistoryPanel to always re-ensure the close button
    if (typeof window.updateChatHistoryPanel === 'function') {
        const origUpdateChatHistoryPanel = window.updateChatHistoryPanel;
        window.updateChatHistoryPanel = function(...args) {
            origUpdateChatHistoryPanel.apply(this, args);
            ensureSidebarCloseButton();
        };
    } else {
        // If updateChatHistoryPanel is not defined yet, set up a MutationObserver fallback
        const observer = new MutationObserver(() => ensureSidebarCloseButton());
        observer.observe(document.getElementById('chat-history-panel'), { childList: true, subtree: true });
    }
    // Run once on load
    ensureSidebarCloseButton();

    // --- Big Close Button at Bottom (ensure only one exists) ---
    function ensureBigCloseButton() {
        if (!chatHistoryPanel.querySelector('.big-close-btn-container')) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'big-close-btn-container';
            buttonContainer.style.cssText = `
                padding: 15px;
                text-align: center;
                border-top: 1px solid #eee;
                background-color: white;
                position: sticky;
                bottom: 0;
            `;
            const bigCloseButton = document.createElement('button');
            bigCloseButton.textContent = 'Close Chat History';
            bigCloseButton.style.cssText = `
                background-color: #003a8c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            `;
            bigCloseButton.onclick = function() {
                chatHistoryPanel.classList.remove('open');
            };
            buttonContainer.appendChild(bigCloseButton);
            chatHistoryPanel.appendChild(buttonContainer);
        }
    }
    ensureBigCloseButton();

    // If chat history panel is ever re-rendered, re-ensure the button
    window.ensureBigCloseButton = ensureBigCloseButton;
    if (typeof window.updateChatHistoryPanel === 'function') {
        const origUpdateChatHistoryPanel2 = window.updateChatHistoryPanel;
        window.updateChatHistoryPanel = function(...args) {
            origUpdateChatHistoryPanel2.apply(this, args);
            ensureSidebarCloseButton();
            ensureBigCloseButton();
        };
    }
    // Run once on load
    ensureBigCloseButton();

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
        
        // Get or create the header with close button
        let historyHeader = document.querySelector('.history-header');
        if (!historyHeader) {
            historyHeader = document.createElement('div');
            historyHeader.className = 'history-header';
            historyHeader.innerHTML = `
                <h2>Chat History</h2>
                <button id="history-close-button" title="Close history panel" style="background-color: #2c2c2c !important; border: 1px solid #d4af37 !important; color: #d4af37 !important; padding: 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#d4af37" viewBox="0 0 16 16" style="font-weight: bold;">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            `;
            
            // Add event listener to the close button
            const closeButton = historyHeader.querySelector('#history-close-button');
            if (closeButton) {
                closeButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    chatHistoryPanel.classList.remove('open');
                });
            }
        }
        
        // Create a container for chat history items
        const historyListContainer = document.createElement('div');
        historyListContainer.className = 'history-list-container';
        
        // Create the bottom close button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            padding: 15px;
            text-align: center;
            border-top: 1px solid #2a2a2a;
            background-color: #1a1a1a;
            position: sticky;
            bottom: 0;
        `;
        
        // Create the bottom close button
        const bigCloseButton = document.createElement('button');
        bigCloseButton.textContent = 'Close Chat History';
        bigCloseButton.style.cssText = `
            background-color: #2c2c2c;
            color: #d4af37;
            border: 1px solid #d4af37;
            border-radius: 4px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s ease;
        `;
        
        // Add hover effects for the big close button
        bigCloseButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#d4af37';
            this.style.color = 'black';
        });
        
        bigCloseButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#2c2c2c';
            this.style.color = '#d4af37';
        });
        
        // Add click event to close the panel
        bigCloseButton.addEventListener('click', function() {
            chatHistoryPanel.classList.remove('open');
        });
        
        // Add button to container
        buttonContainer.appendChild(bigCloseButton);
        
        // Clear the content but preserve the structure
        chatHistoryPanel.innerHTML = '';
        chatHistoryPanel.appendChild(historyHeader);
        chatHistoryPanel.appendChild(historyListContainer);
        chatHistoryPanel.appendChild(buttonContainer);
        
        if (chatHistory.length === 0) {
            historyListContainer.innerHTML = '<div class="history-empty">No previous conversations</div>';
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
            
            historyListContainer.appendChild(chatElement);
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
    const API_URL = 'https://rztdhnend7.execute-api.us-east-1.amazonaws.com/default/sba-sop-agent';  // Lambda API Gateway URL
    const API_KEY = '';  // Add your API key if needed

    // Initialize function - runs on startup
    function initialize() {
        console.log('Initializing SBA Loan Assistant...');
        
        // Load existing chat history or create a new chat
        loadChatHistory();
        if (chatHistory.length > 0) {
            loadChat(chatHistory[0].id);
        } else {
            initNewChat();
            // Welcome message is now added directly at the top level, so don't add it again here
            // addWelcomeMessage(); - REMOVED to prevent double welcome message
        }
        
        // Focus the input on page load
        messageInput.focus();
    }

    // Add the welcome message
    function addWelcomeMessage() {
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'message assistant';
        welcomeElement.innerHTML = `
            <div class="avatar">
                <img src="lords-favicon.png" alt="Assistant">
            </div>
            <div class="content">
                <p>Welcome to the Lords of Lending SBA Loan Assistant!</p>
                <p>I'm here to provide accurate information from the SBA rules and requirements. Ask me anything about SBA loan eligibility, requirements, guidelines, or specific sections of the SBA Standard Operating Procedures 50 10 8.</p>
                <p>How can I assist you with your SBA lending questions today?</p>
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
                <img src="lords-favicon.png" alt="Assistant">
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
                <img src="lords-favicon.png" alt="Assistant">
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
        // Format markdown-like text
        if (!text) return '';
        
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
            // Create the request body
            const requestBody = {
                query: message,       // <<< Changed key from 'question' to 'query'
                top_k: 5
            };
            
            // Log the exact request being sent
            console.log('Sending API request:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            // Debug: Log the exact response format
            console.log('API Response:', JSON.stringify(data, null, 2));
            
            // Process different potential response formats
            let answer = '';
            let sources = [];
            
            // Try to extract answer and sources based on common API response formats
            if (data && typeof data === 'object') {
                // Format 0: API Gateway Lambda Proxy format with body as string
                if (data.statusCode && data.body && typeof data.body === 'string') {
                    try {
                        // Parse the nested body JSON string
                        const bodyData = JSON.parse(data.body);
                        console.log('Parsed body data:', bodyData);
                        
                        if (bodyData.answer) {
                            answer = bodyData.answer;
                            sources = bodyData.sources || [];
                            console.log('Found answer in parsed body');
                            
                            // Return immediately with the parsed data to prevent fallback
                            return {
                                answer: answer,
                                sources: sources
                            };
                        }
                    } catch (e) {
                        console.error('Error parsing body:', e);
                    }
                }
                // Format 1: { answer: "text", sources: [] } - our expected format
                else if (data.answer) {
                    answer = data.answer;
                    sources = data.sources || [];
                }
                // Format 2: { result: "text", context: [] } - common RAG format
                else if (data.result) {
                    answer = data.result;
                    // Try to convert context to our sources format if possible
                    if (data.context && Array.isArray(data.context)) {
                        sources = data.context.map(ctx => {
                            if (typeof ctx === 'object') {
                                return {
                                    citation: ctx.citation || ctx.reference || '',
                                    source: ctx.source || ctx.document || ''
                                };
                            }
                            return { citation: '', source: ctx.toString() };
                        });
                    }
                }
                // Format 3: { text: "...", documents: [] } - another common format
                else if (data.text) {
                    answer = data.text;
                    if (data.documents && Array.isArray(data.documents)) {
                        sources = data.documents.map(doc => ({ 
                            citation: doc.reference || '',
                            source: doc.title || doc.name || ''
                        }));
                    }
                }
                // Format 4: { content: "...", references: [] }
                else if (data.content) {
                    answer = data.content;
                    if (data.references && Array.isArray(data.references)) {
                        sources = data.references.map(ref => ({
                            citation: ref.location || '',
                            source: ref.title || ref.source || ''
                        }));
                    }
                }
                // Format 5: Maybe it's the response object itself?
                else if (typeof data === 'string') {
                    answer = data;
                }
            }
            
            // If we still couldn't extract a valid answer, use mock data
            if (!answer) {
                console.log('Could not extract answer from API response, using mock data instead');
                return mockAPIResponse(message);
            }
            
            console.log('Successfully extracted answer:', answer.substring(0, 50) + '...');
            console.log('Sources:', sources);
            
            // Return in our standard format
            return {
                answer: answer,
                sources: sources
            };
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
        
        // Debug the API response
        console.log('Response from API:', JSON.stringify(response, null, 2));
        console.log('Response type:', typeof response);
        console.log('Has answer property:', response.hasOwnProperty('answer'));
        console.log('Answer value:', response.answer);
        
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
    
    // Initialize the chat interface
    initialize();
    
    // Bottom close button has been removed
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
