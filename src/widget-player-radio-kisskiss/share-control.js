/**
 * Share Control Script
 * Gestisce l'apertura del modale di condivisione con drag to dismiss su mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    const shareBtnDesktop = document.getElementById('share-btn-desktop');
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('kisskiss-share-modal');
    const shareOptionsContainer = document.getElementById('kisskiss-share-options');
    const shareCloseBtn = document.getElementById('kisskiss-share-modal-close');
  
    if (!shareBtn || !shareBtnDesktop || !shareModal) return;

    // Funzione per costruire le opzioni di condivisione
    function renderShareOptions() {
        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const pluginUrl = window.kisskissData.pluginUrl;

        shareOptionsContainer.innerHTML = `
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-facebook" title="Condividi su Facebook">
            <img src="${pluginUrl}facebookIcon.svg" alt="Facebook" class="kisskiss-share-icon-img" />
            <span>Facebook</span>
          </a>
          
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-twitter" title="Condividi su X">
            <img src="${pluginUrl}xIcon.svg" alt="X" class="kisskiss-share-icon-img" />
            <span>X</span>
          </a>
          
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-whatsapp" title="Condividi su WhatsApp">
            <img src="${pluginUrl}whatsappIcon.svg" alt="WhatsApp" class="kisskiss-share-icon-img" />
            <span>WhatsApp</span>
          </a>
          
          <a href="https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-telegram" title="Condividi su Telegram">
            <img src="${pluginUrl}telegramIcon.svg" alt="Telegram" class="kisskiss-share-icon-img" />
            <span>Telegram</span>
          </a>
        `;
 
    }

    function openShareModal() {
        renderShareOptions();
        // Rimuovi eventuale opzione "Copia" residua (difensivo, per cache o markup esterno)
        const existingCopy = shareOptionsContainer.querySelector('.kisskiss-share-copy');
        if (existingCopy) existingCopy.remove();
        shareModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeShareModal() {
        shareModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Event listeners per apertura
    shareBtnDesktop.addEventListener('click', function(e) {
        e.preventDefault();
        openShareModal();
    });

    shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openShareModal();
    });

    // Event listener per chiusura pulsante X
    shareCloseBtn.addEventListener('click', closeShareModal);

    // Chiudi al click fuori dal modal (overlay)
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });

    // ========== DRAG TO DISMISS PER MOBILE ==========
    const modalContainer = shareModal.querySelector('.kisskiss-modal-container');
    const dragHandle = shareModal.querySelector('.kisskiss-drag-handle');
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isDragging = false;
    const dragThreshold = 100; // pixel necessari per chiudere

    console.log('[SHARE-DRAG] Drag handle trovato:', !!dragHandle, '[SHARE-DRAG] Modal container trovato:', !!modalContainer);

    if (dragHandle) {
        dragHandle.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isDragging = true;
            console.log('[SHARE-DRAG] Touch start:', touchStartY);
        }, false);
    }

    if (modalContainer) {
        modalContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchCurrentY = e.touches[0].clientY;
            const drag = touchCurrentY - touchStartY;

            console.log('[SHARE-DRAG] Dragging:', drag, 'px');

            if (drag > 0) {
                e.preventDefault();
                modalContainer.style.transform = `translateY(${drag}px)`;
                modalContainer.style.transition = 'none';
            }
        }, { passive: false });

        modalContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const drag = touchCurrentY - touchStartY;
            console.log('[SHARE-DRAG] Touch end - drag distance:', drag, 'threshold:', dragThreshold);

            modalContainer.style.transition = 'transform 0.3s ease';

            if (drag > dragThreshold) {
                console.log('[SHARE-DRAG] Closing modal');
                // Chiudi il modale
                modalContainer.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    closeShareModal();
                    modalContainer.style.transform = 'translateY(0)';
                    modalContainer.style.transition = 'none';
                }, 300);
            } else {
                console.log('[SHARE-DRAG] Returning to original position');
                // Ritorna alla posizione originale
                modalContainer.style.transform = 'translateY(0)';
                setTimeout(() => {
                    modalContainer.style.transition = 'none';
                }, 300);
            }
        }, false);
    }

    console.log('Share Control pronto');
});
