/**
 * CX Lending SBA Assistant Embed Script
 * 
 * This script allows you to embed the SBA Assistant chat interface
 * into any webpage on your cxlending.com website.
 * 
 * Usage:
 * 1. Add this script to your website:
 *    <script src="https://sba.cxlending.com/embed.js"></script>
 * 
 * 2. Add the chat widget:
 *    <div id="cx-sba-assistant"></div>
 * 
 * 3. Or use as a floating button:
 *    <script>
 *      CxSbaAssistant.init({
 *        floating: true,
 *        position: 'bottom-right', // or 'bottom-left'
 *        buttonText: 'SBA Assistant',
 *        buttonIcon: true
 *      });
 *    </script>
 */

(function() {
    // Configuration
    const config = {
        baseUrl: 'https://sba.cxlending.com', // Change to your actual URL
        defaultOptions: {
            floating: false,
            position: 'bottom-right',
            buttonText: 'SBA Assistant',
            buttonIcon: true,
            width: '100%',
            height: '600px',
            containerSelector: '#cx-sba-assistant',
            themeColor: '#0056b3'
        }
    };
    
    // Widget state
    let state = {
        initialized: false,
        isOpen: false
    };
    
    // Initialize the chat widget
    function init(options = {}) {
        if (state.initialized) {
            console.warn('CX SBA Assistant is already initialized');
            return;
        }
        
        // Merge options with defaults
        const settings = { ...config.defaultOptions, ...options };
        
        // If floating widget
        if (settings.floating) {
            createFloatingWidget(settings);
        } else {
            // Inline widget
            const container = document.querySelector(settings.containerSelector);
            if (!container) {
                console.error(`Container ${settings.containerSelector} not found`);
                return;
            }
            
            createInlineWidget(container, settings);
        }
        
        state.initialized = true;
    }
    
    // Create the inline widget
    function createInlineWidget(container, settings) {
        // Set container styles
        container.style.width = settings.width;
        container.style.height = settings.height;
        container.style.overflow = 'hidden';
        container.style.borderRadius = '12px';
        container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${config.baseUrl}?embed=true`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.title = 'SBA Assistant';
        iframe.allow = 'microphone';
        
        // Append iframe to container
        container.appendChild(iframe);
    }
    
    // Create the floating widget
    function createFloatingWidget(settings) {
        // Create styles
        const styles = document.createElement('style');
        styles.innerHTML = `
            .cx-sba-widget-button {
                position: fixed;
                ${settings.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
                bottom: 20px;
                background-color: ${settings.themeColor};
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                z-index: 9999;
            }
            
            .cx-sba-widget-button:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                transform: translateY(-2px);
            }
            
            .cx-sba-widget-button svg {
                margin-right: 8px;
            }
            
            .cx-sba-widget-container {
                position: fixed;
                ${settings.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
                bottom: 90px;
                width: 380px;
                height: 600px;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                transition: all 0.3s ease;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
            }
            
            .cx-sba-widget-container.open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .cx-sba-widget-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            @media (max-width: 480px) {
                .cx-sba-widget-container {
                    width: 90%;
                    left: 5%;
                    right: 5%;
                    height: 80vh;
                    bottom: 80px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        
        // Create button
        const button = document.createElement('button');
        button.className = 'cx-sba-widget-button';
        
        // Add icon if enabled
        if (settings.buttonIcon) {
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>
            `;
        }
        
        // Add text
        const span = document.createElement('span');
        span.textContent = settings.buttonText;
        button.appendChild(span);
        
        // Create container
        const container = document.createElement('div');
        container.className = 'cx-sba-widget-container';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'cx-sba-widget-iframe';
        iframe.src = `${config.baseUrl}?embed=true`;
        iframe.title = 'SBA Assistant';
        iframe.allow = 'microphone';
        
        // Append elements
        container.appendChild(iframe);
        document.body.appendChild(button);
        document.body.appendChild(container);
        
        // Add event listener
        button.addEventListener('click', function() {
            state.isOpen = !state.isOpen;
            
            if (state.isOpen) {
                container.classList.add('open');
            } else {
                container.classList.remove('open');
            }
        });
    }
    
    // Expose public API
    window.CxSbaAssistant = {
        init: init
    };
    
    // Auto-initialize if container exists
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector(config.defaultOptions.containerSelector);
        if (container) {
            init();
        }
    });
})();