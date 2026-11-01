// IntersectionObserver-based scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });

  // Active nav section tracking
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // On mobile the pill scrolls horizontally: keep the active link in view.
  function revealInPill(link) {
    const pill = link.closest('.nav-pill');
    if (!pill || pill.scrollWidth <= pill.clientWidth) return;
    const pillBox = pill.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.left >= pillBox.left + 12 && linkBox.right <= pillBox.right - 20) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pill.scrollBy({ left: linkBox.left - pillBox.left - 16, behavior: reduce ? 'auto' : 'smooth' });
  }

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', isActive);
            if (isActive) {
              link.setAttribute('aria-current', 'true');
              revealInPill(link);
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  sections.forEach((section) => navObserver.observe(section));
});
