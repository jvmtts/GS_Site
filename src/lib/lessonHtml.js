import DOMPurify from 'dompurify';
import { hasLessonHtml, toLessonHtml } from './lessonText.js';

export function sanitizeLessonHtml(value) {
  return DOMPurify.sanitize(toLessonHtml(value), {
    ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'br', 'blockquote', 'code'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

export function lessonPreview(value) {
  const text = String(value ?? '');
  if (!hasLessonHtml(text)) return text.replace(/\s+/g, ' ').trim().slice(0, 250);

  const document = new DOMParser().parseFromString(sanitizeLessonHtml(text), 'text/html');
  document.body.querySelectorAll('p, h2, h3, h4, li, blockquote, br').forEach((element) => {
    element.after(document.createTextNode(' '));
  });
  return document.body.textContent.replace(/\s+/g, ' ').trim().slice(0, 250);
}
