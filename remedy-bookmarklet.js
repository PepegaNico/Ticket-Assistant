// Remedy Assistant Bookmarklet
// Drag this to your bookmarks bar or save as a bookmark
// Click it when viewing a Remedy ticket to extract data and open the assistant

javascript:(function(){
  // Extract ticket data from Remedy page
  // Adjust selectors based on your actual Remedy interface
  var ticketData = {
    description: document.querySelector('[aria-label="Description"]')?.innerText || 
                 document.querySelector('textarea[name*="description"]')?.value || '',
    summary: document.querySelector('[aria-label="Summary"]')?.innerText ||
             document.querySelector('input[name*="summary"]')?.value || '',
    ticketId: document.querySelector('[aria-label="Incident Number"]')?.innerText || '',
    category: document.querySelector('[aria-label="Categorization Tier 1"]')?.innerText || '',
    userName: document.querySelector('[aria-label="First Name"]')?.innerText || ''
  };
  
  // Open assistant with ticket data
  var assistantUrl = 'http://10.128.128.178:5000';
  var params = new URLSearchParams(ticketData).toString();
  window.open(assistantUrl + '?ticket=' + encodeURIComponent(JSON.stringify(ticketData)), 
              'RemedyAssistant', 
              'width=800,height=900');
})();
