(function () {
  const mount = document.getElementById('blog-update-calendar');
  if (!mount) return;

  const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
  const todayKey = formatDate(new Date());
  let state = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    data: null
  };

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getLevel(count) {
    if (count >= 3) return 'level-3';
    if (count === 2) return 'level-2';
    if (count === 1) return 'level-1';
    return '';
  }

  function setInitialMonth(posts) {
    if (!posts || posts.length === 0) return;
    const latest = new Date(`${posts[0].date}T00:00:00`);
    if (!Number.isNaN(latest.getTime())) {
      state.year = latest.getFullYear();
      state.month = latest.getMonth();
    }
  }

  function render() {
    const days = state.data.days || {};
    const posts = state.data.posts || [];
    const firstDay = new Date(state.year, state.month, 1);
    const lastDay = new Date(state.year, state.month + 1, 0);
    const monthKey = `${state.year}-${String(state.month + 1).padStart(2, '0')}`;
    const monthPosts = posts.filter(post => post.date.startsWith(monthKey));
    const cells = [];

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      cells.push('<span class="blog-calendar__day is-empty" aria-hidden="true"></span>');
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = `${monthKey}-${String(day).padStart(2, '0')}`;
      const count = days[date] || 0;
      const classes = [
        'blog-calendar__day',
        count > 0 ? 'has-posts' : '',
        getLevel(count),
        date === todayKey ? 'is-today' : ''
      ].filter(Boolean).join(' ');
      const title = count > 0 ? `${date} 更新 ${count} 篇` : `${date} 无更新`;
      cells.push(`<span class="${classes}" title="${title}">${day}</span>`);
    }

    const recentPosts = posts.slice(0, 3).map(post => {
      return `<div class="blog-calendar__post"><time>${post.date.slice(5)}</time><a href="${post.url}" title="${post.title}">${post.title}</a></div>`;
    }).join('');

    mount.innerHTML = `
      <div class="blog-calendar__head">
        <button class="blog-calendar__nav" type="button" data-calendar-nav="prev" aria-label="上个月">‹</button>
        <div class="blog-calendar__title">${state.year} 年 ${state.month + 1} 月</div>
        <button class="blog-calendar__nav" type="button" data-calendar-nav="next" aria-label="下个月">›</button>
      </div>
      <div class="blog-calendar__week">${weekNames.map(name => `<span>${name}</span>`).join('')}</div>
      <div class="blog-calendar__grid">${cells.join('')}</div>
      <div class="blog-calendar__summary"><span>本月更新</span><strong>${monthPosts.length} 篇</strong></div>
      <div class="blog-calendar__legend"><span>少</span><span></span><span class="level-1"></span><span class="level-2"></span><span class="level-3"></span><span>多</span></div>
      <div class="blog-calendar__recent">${recentPosts}</div>
    `;
  }

  mount.addEventListener('click', event => {
    const button = event.target.closest('[data-calendar-nav]');
    if (!button || !state.data) return;

    const delta = button.dataset.calendarNav === 'prev' ? -1 : 1;
    const next = new Date(state.year, state.month + delta, 1);
    state.year = next.getFullYear();
    state.month = next.getMonth();
    render();
  });

  fetch('/calendar.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Calendar data request failed');
      return response.json();
    })
    .then(data => {
      state.data = data;
      setInitialMonth(data.posts);
      if (!data.posts || data.posts.length === 0) {
        mount.innerHTML = '<div class="calendar-empty">还没有文章更新。</div>';
        return;
      }
      render();
    })
    .catch(() => {
      mount.innerHTML = '<div class="calendar-empty">更新日历暂时加载失败。</div>';
    });
})();
