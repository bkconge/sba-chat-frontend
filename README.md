# CX Lending SBA Assistant Chat Widget

This is a custom chat interface for the CX Lending SBA Assistant, designed to be easily embedded into your Webflow website.

## Features

- **Modern Chat Interface**: Clean, responsive design that mimics popular AI assistants like ChatGPT and Claude
- **Chat History**: Users can access their previous conversations
- **Citation Support**: References to SBA SOP documents are clearly displayed
- **Easy Integration**: Multiple ways to add to your Webflow site
- **Customizable**: Adjust colors and styles to match your brand
- **Responsive**: Works on desktop and mobile devices

## Integration Options

### 1. Embed as an iFrame (Easiest)

1. In Webflow, add an "Embed" element where you want the chat to appear
2. Paste this code:

```html
<iframe 
  src="https://sba.cxlending.com?embed=true" 
  width="100%" 
  height="600px" 
  style="border:none; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  title="SBA Assistant">
</iframe>
```

### 2. Add as a Floating Chat Button

1. In Webflow, go to your site settings and add the following code to the "Custom Code" section in the "Footer Code" area:

```html
<script src="https://sba.cxlending.com/embed.js"></script>
<script>
  CxSbaAssistant.init({
    floating: true,
    position: 'bottom-right',
    buttonText: 'SBA Assistant',
    buttonIcon: true,
    themeColor: '#0056b3'  // Customize to match your brand
  });
</script>
```

### 3. Add as an Inline Widget

1. In Webflow, add a "Div Block" element where you want the chat to appear
2. Give it an ID of "cx-sba-assistant" and set a minimum height (e.g., 600px)
3. Add the following code to the "Custom Code" section in the "Footer Code" area:

```html
<script src="https://sba.cxlending.com/embed.js"></script>
```

## Customization Options

When using the JavaScript embed method (options 2 & 3), you can customize the widget with these options:

```javascript
CxSbaAssistant.init({
  // Basic options
  floating: true,               // true for floating button, false for inline
  position: 'bottom-right',     // 'bottom-right' or 'bottom-left'
  buttonText: 'SBA Assistant',  // Text on the button
  buttonIcon: true,             // Show icon on button
  themeColor: '#0056b3',        // Primary color
  
  // Size options (for inline widget)
  width: '100%',                // Width of the widget
  height: '600px',              // Height of the widget
  
  // Selector (for inline widget)
  containerSelector: '#cx-sba-assistant'  // CSS selector for the container
});
```

## Webflow Setup Tips

### Custom Domain Setup

To use a subdomain like "sba.cxlending.com", you'll need to:

1. Set up the subdomain in your domain provider
2. Configure the DNS settings to point to your SBA Assistant server
3. Add the subdomain in Webflow's hosting settings

### Mobile Responsiveness

The chat widget is designed to be responsive, but you may want to adjust the styles for mobile:

1. In Webflow, use the responsive design features to adjust the container size on mobile
2. For floating buttons, no additional setup is needed - it automatically adapts to mobile screens

### Styling the Container

You can style the container div in Webflow to control how the widget appears:

```css
#cx-sba-assistant {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin: 20px 0;
}
```

## Technical Details

### Browser Support

The SBA Assistant works with:
- Chrome, Firefox, Safari, Edge (latest versions)
- iOS 12+
- Android 8+

### Data Storage

The chat history is stored in the user's browser using localStorage. No user data is sent to your server except for their chat messages to obtain responses from the SBA knowledge base.

### Performance Impact

The chat widget is designed to be lightweight and shouldn't significantly impact your website's performance. The JavaScript file is small, and resources are loaded only when the widget is used.