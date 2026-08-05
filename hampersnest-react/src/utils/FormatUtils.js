export const getPlainTextPreview = (html, maxLength = 100) => {
  if (!html) return '';
  
  // 1. Create a dummy element to parse HTML entities and strip tags
  // This safely handles &nbsp;, &amp;, etc.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // 2. Collapse multiple spaces and newlines into a single space
  text = text.replace(/\s+/g, ' ').trim();
  
  // 3. Truncate if necessary
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }
  
  return text;
};
