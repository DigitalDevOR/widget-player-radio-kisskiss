/**
 * Share Control Script
 * Permette di condividere l'URL della pagina su varie piattaforme
 */

document.addEventListener('DOMContentLoaded', function() {
    const shareBtnDesktop = document.getElementById('share-btn-desktop');
    const shareBtn = document.getElementById('share-btn');
  
  if (!shareBtn || !shareBtnDesktop) return;

    shareBtnDesktop.addEventListener('click', function(e) {
        e.preventDefault();
        openShareDialog();
    });

    shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openShareDialog();
    });

  function openShareDialog() {
    const pageUrl = window.location.href;
    const pageTitle = document.title;
    const pluginUrl = window.kisskissData.pluginUrl;

    // Crea il dialog HTML
    const dialog = document.createElement('div');
    dialog.className = 'kisskiss-share-dialog-overlay';
    dialog.innerHTML = `
      <div class="kisskiss-share-dialog">
        <div class="kisskiss-share-header">
          <h3>Condividi</h3>
          <button class="kisskiss-share-close">&times;</button>
        </div>
        
        <div class="kisskiss-share-options">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-facebook">
            <img src="${pluginUrl}facebookIcon.svg" alt="Facebook" class="kisskiss-share-icon-img" />
            <span>Facebook</span>
          </a>
          
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-twitter">
            <img src="${pluginUrl}xIcon.svg" alt="X" class="kisskiss-share-icon-img" />
            <span>X</span>
          </a>
          
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-whatsapp">
            <img src="${pluginUrl}whatsappIcon.svg" alt="WhatsApp" class="kisskiss-share-icon-img" />
            <span>WhatsApp</span>
          </a>
          
          <a href="https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}" 
             target="_blank" class="kisskiss-share-option kisskiss-share-telegram">
            <img src="${pluginUrl}telegramIcon.svg" alt="Telegram" class="kisskiss-share-icon-img" />
            <span>Telegram</span>
          </a>
          
          <button class="kisskiss-share-option kisskiss-share-copy" data-url="${pageUrl}">
            <span class="kisskiss-share-icon">📋</span>
            <span>Copia link</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Blocca lo scroll del body
    document.body.style.overflow = 'hidden';

    // Close button
    const closeBtn = dialog.querySelector('.kisskiss-share-close');
    closeBtn.addEventListener('click', function() {
      // Sblocca lo scroll
      document.body.style.overflow = '';
      dialog.remove();
    });

    // Chiudi al click fuori dal dialog
    dialog.addEventListener('click', function(e) {
      if (e.target === dialog) {
        // Sblocca lo scroll
        document.body.style.overflow = '';
        dialog.remove();
      }
    });

    // Copia link
    const copyBtn = dialog.querySelector('.kisskiss-share-copy');
    copyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const url = this.getAttribute('data-url');
      
      navigator.clipboard.writeText(url).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="kisskiss-share-icon">✓</span><span>Copiato!</span>';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      }).catch(() => {
        // Fallback per browser vecchi
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        copyBtn.innerHTML = '<span class="kisskiss-share-icon">✓</span><span>Copiato!</span>';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  console.log('Share Control pronto');
});
