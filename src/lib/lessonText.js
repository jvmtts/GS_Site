export function hasLessonHtml(value) {
  return /<\/?[a-z][^>]*>/i.test(String(value ?? ''));
}

export function toLessonHtml(value) {
  const text = String(value ?? '').trim();
  if (!text || hasLessonHtml(text)) return text;

  return text.split(/\r?\n\s*\r?\n/).map((paragraph) => {
    const escaped = paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<p>${escaped.replace(/\r?\n/g, '<br>')}</p>`;
  }).join('\n');
}
