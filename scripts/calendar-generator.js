'use strict';

function toDateString(value) {
  if (!value) return '';
  if (typeof value.format === 'function') return value.format('YYYY-MM-DD');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

hexo.extend.generator.register('update-calendar', function calendarGenerator(locals) {
  const dayMap = {};
  const posts = [];

  locals.posts
    .filter(post => post.published !== false)
    .sort('date', -1)
    .forEach(post => {
      const date = toDateString(post.date);
      if (!date) return;

      dayMap[date] = (dayMap[date] || 0) + 1;
      posts.push({
        title: post.title || '未命名文章',
        date,
        url: this.config.root + post.path
      });
    });

  const payload = {
    generatedAt: new Date().toISOString(),
    totalPosts: posts.length,
    days: dayMap,
    posts
  };

  return {
    path: 'calendar.json',
    data: JSON.stringify(payload)
  };
});
