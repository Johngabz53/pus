// This script initializes the localStorage if needed
document.addEventListener('DOMContentLoaded', function() {
    // Check if localStorage already has messages
    if (!localStorage.getItem('instagramMessages')) {
        // Initialize with empty array
        localStorage.setItem('instagramMessages', JSON.stringify([]));
    }
    
    // Initialize typing status
    if (!localStorage.getItem('adminTyping')) {
        localStorage.setItem('adminTyping', 'false');
    }
    
    console.log('Instagram clone initialized!');
});