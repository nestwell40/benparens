// Photo Gallery with Lightbox
(function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item:not(.placeholder)');

  if (!lightbox || !lightboxImg) return;

  // Open lightbox
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // Click on gallery item
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const src = item.dataset.src || img?.src;
      const alt = img?.alt || '';
      if (src) openLightbox(src, alt);
    });
  });

  // Close button
  lightboxClose?.addEventListener('click', closeLightbox);

  // Click outside image to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Keyboard navigation (left/right arrows)
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (galleryItems.length === 0) return;

    const currentSrc = lightboxImg.src;
    let currentIndex = -1;

    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');
      const src = item.dataset.src || img?.src;
      if (src === currentSrc) {
        currentIndex = index;
      }
    });

    if (currentIndex === -1) return;

    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % galleryItems.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    } else {
      return;
    }

    const newItem = galleryItems[newIndex];
    const newImg = newItem.querySelector('img');
    const newSrc = newItem.dataset.src || newImg?.src;
    const newAlt = newImg?.alt || '';

    if (newSrc) {
      lightboxImg.src = newSrc;
      lightboxImg.alt = newAlt;
    }
  });
})();
