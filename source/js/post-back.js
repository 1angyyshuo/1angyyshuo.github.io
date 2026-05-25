(function () {
  const isPostPage = Boolean(document.getElementById('post'));
  if (!isPostPage || document.querySelector('.post-back-button')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'post-back-button';
  button.setAttribute('aria-label', '返回上一篇页面');
  button.innerHTML = '<i class="fas fa-arrow-left" aria-hidden="true"></i><span>返回</span>';

  button.addEventListener('click', () => {
    if (window.history.length > 1 && document.referrer) {
      window.history.back();
      return;
    }
    window.location.href = '/';
  });

  document.body.appendChild(button);
  requestAnimationFrame(() => button.classList.add('is-visible'));
})();
