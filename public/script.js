// ===== Header scroll effect =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile menu toggle =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.querySelector('.nav');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('open');
  nav.classList.toggle('open');
});

// Close menu on link click
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('open');
    nav.classList.remove('open');
  });
});

// ===== Active nav on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const scrollY = window.scrollY + 150;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav);

// ===== Scroll reveal animations =====
function addRevealClasses() {
  const revealTargets = [
    '.about .section-label',
    '.about-text h2',
    '.about-text .section-divider',
    '.about-text p',
    '.about-img-wrapper',
    '.menu-section .section-label',
    '.menu-title',
    '.menu-card',
    '.experience-content > *',
    '.services .section-label',
    '.service-card',
    '.location-info > *',
    '.cta-section > *',
  ];

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i < 5) el.classList.add('reveal-delay-' + (i + 1));
    });
  });
}

addRevealClasses();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== Parallax on floating kanji =====
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      document.querySelectorAll('.kanji').forEach((k, i) => {
        const speed = 0.02 + (i * 0.008);
        k.style.transform = `translateY(${scrollY * speed}px) rotate(${(i % 2 === 0 ? -1 : 1) * 5}deg)`;
      });
      ticking = false;
    });
    ticking = true;
  }
});

// ===== Floating menu cards subtle animation =====
document.querySelectorAll('.menu-card, .service-card').forEach(card => {
  const float = card.dataset.float || 1;
  const delay = float * 0.5;
  card.style.animationDelay = delay + 's';
});
