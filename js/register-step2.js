/**
 * YUDU Restaurant Partner Portal - Register Step 2 (Verification Documents) Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Document metadata registry
  const docMeta = {
    fssai: { label: 'FSSAI License', inputId: 'file-input-fssai', slotId: 'slot-fssai' },
    gst: { label: 'GST Certificate', inputId: 'file-input-gst', slotId: 'slot-gst' },
    pan: { label: 'PAN Card', inputId: 'file-input-pan', slotId: 'slot-pan' },
    cheque: { label: 'Cancelled Cheque / Bank Proof', inputId: 'file-input-cheque', slotId: 'slot-cheque' }
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  // Local state reference
  let currentData = getYuduData();
  let docsState = currentData.step2.documents || {};
  let photosState = currentData.step2.photos || [];

  // Default Figma Reference State (2 uploaded, 2 pending, 3 photos)
  const figmaDemoDocs = {
    fssai: { name: 'fssai_license.pdf', size: 1.2 * 1024 * 1024, sizeFormatted: '1.2 MB', type: 'application/pdf', uploadedAt: new Date().toISOString() },
    gst: { name: 'gst_certificate.pdf', size: 860 * 1024, sizeFormatted: '860 KB', type: 'application/pdf', uploadedAt: new Date().toISOString() },
    pan: null,
    cheque: null
  };

  const figmaDemoPhotos = [
    { id: 'p1', name: 'ambiance-yellow.jpg', style: 'style-yellow' },
    { id: 'p2', name: 'kitchen-orange.jpg', style: 'style-orange' },
    { id: 'p3', name: 'dining-coral.jpg', style: 'style-coral' }
  ];

  // Initialize with Figma reference state if empty
  if (!docsState.fssai && !docsState.gst && !docsState.pan && !docsState.cheque && photosState.length === 0) {
    docsState = JSON.parse(JSON.stringify(figmaDemoDocs));
    photosState = JSON.parse(JSON.stringify(figmaDemoPhotos));
    persistStep2();
  }

  // --------------------------------------------------------------------------
  // Document Rendering Logic
  // --------------------------------------------------------------------------
  function renderAllDocuments() {
    Object.keys(docMeta).forEach(key => {
      renderDocSlot(key);
    });
    renderPhotosGallery();
    updateChecklist();
    refreshIcons();
  }

  function renderDocSlot(key) {
    const info = docMeta[key];
    const wrapper = document.getElementById(info.slotId);
    if (!wrapper) return;

    const doc = docsState[key];

    if (doc) {
      // UPLOADED STATE CARD
      wrapper.innerHTML = `
        <div class="doc-card-uploaded animate-fade-in">
          <div class="doc-info-left">
            <div class="doc-icon-container">
              <i data-lucide="file-text"></i>
            </div>
            <div class="doc-text-details">
              <span class="doc-title-text">${info.label}</span>
              <span class="doc-file-meta">${doc.name} · ${doc.sizeFormatted || formatBytes(doc.size)}</span>
            </div>
          </div>
          <div class="doc-uploaded-actions">
            <span class="doc-badge-status">Uploaded</span>
            <button type="button" class="doc-action-btn" data-action="replace" data-key="${key}" title="Replace document">Replace</button>
            <button type="button" class="doc-action-btn delete" data-action="delete" data-key="${key}" title="Delete document">Delete</button>
          </div>
        </div>
      `;
    } else {
      // PENDING DROPZONE AREA
      wrapper.innerHTML = `
        <div class="doc-upload-dropzone animate-fade-in" data-key="${key}" tabindex="0" role="button">
          <div class="upload-icon-circle">
            <i data-lucide="upload"></i>
          </div>
          <div class="upload-prompt-title">Upload ${info.label}</div>
          <div class="upload-prompt-sub">PDF, JPG or PNG · up to 5 MB</div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // Slot Click & Drag-Drop Handling
  // --------------------------------------------------------------------------
  document.querySelectorAll('.doc-slot-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      const dropzone = e.target.closest('.doc-upload-dropzone');
      const replaceBtn = e.target.closest('[data-action="replace"]');
      const deleteBtn = e.target.closest('[data-action="delete"]');

      if (dropzone) {
        const key = dropzone.getAttribute('data-key');
        const input = document.getElementById(docMeta[key].inputId);
        if (input) input.click();
      } else if (replaceBtn) {
        const key = replaceBtn.getAttribute('data-key');
        const input = document.getElementById(docMeta[key].inputId);
        if (input) input.click();
      } else if (deleteBtn) {
        const key = deleteBtn.getAttribute('data-key');
        docsState[key] = null;
        persistStep2();
        renderDocSlot(key);
        updateChecklist();
        refreshIcons();
        showToast('Document Removed', `${docMeta[key].label} was removed.`, 'info');
      }
    });

    // Drag and Drop
    wrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dropzone = e.target.closest('.doc-upload-dropzone');
      if (dropzone) dropzone.classList.add('dragover');
    });

    wrapper.addEventListener('dragleave', (e) => {
      const dropzone = e.target.closest('.doc-upload-dropzone');
      if (dropzone) dropzone.classList.remove('dragover');
    });

    wrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      const dropzone = e.target.closest('.doc-upload-dropzone');
      if (dropzone) {
        dropzone.classList.remove('dragover');
        const key = dropzone.getAttribute('data-key');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processDocUpload(key, e.dataTransfer.files[0]);
        }
      }
    });
  });

  // Attach change event for each hidden file input
  Object.keys(docMeta).forEach(key => {
    const input = document.getElementById(docMeta[key].inputId);
    if (input) {
      input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          processDocUpload(key, e.target.files[0]);
        }
        input.value = ''; // Reset input
      });
    }
  });

  function processDocUpload(key, file) {
    if (file.size > MAX_FILE_SIZE) {
      showToast('File Too Large', `The selected file exceeds 5 MB. Please upload a smaller file.`, 'error');
      return;
    }

    const validExtensions = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      showToast('Invalid File Type', 'Please upload a PDF, JPG, or PNG document.', 'error');
      return;
    }

    // Read and store
    docsState[key] = {
      name: file.name,
      size: file.size,
      sizeFormatted: formatBytes(file.size),
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    persistStep2();
    renderDocSlot(key);
    updateChecklist();
    refreshIcons();
    showToast('Document Uploaded', `${docMeta[key].label} uploaded successfully.`, 'success');
  }

  // --------------------------------------------------------------------------
  // Restaurant Photos Gallery Logic
  // --------------------------------------------------------------------------
  const photosGallery = document.getElementById('photos-gallery');
  const photoFileInput = document.getElementById('photo-file-input');
  const photoCountLabel = document.getElementById('photo-count-label');

  function renderPhotosGallery() {
    if (!photosGallery) return;
    photosGallery.innerHTML = '';

    photosState.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = `photo-thumb-card ${photo.style || 'style-purple'}`;

      if (photo.dataUrl) {
        card.innerHTML = `
          <img src="${photo.dataUrl}" alt="Restaurant Photo ${idx + 1}">
          <button type="button" class="photo-remove-btn" data-index="${idx}" title="Remove photo">&times;</button>
        `;
      } else {
        card.innerHTML = `
          <div class="photo-placeholder-icon">
            <i data-lucide="utensils"></i>
          </div>
          <button type="button" class="photo-remove-btn" data-index="${idx}" title="Remove photo">&times;</button>
        `;
      }

      photosGallery.appendChild(card);
    });

    // Add Photo Button (If fewer than 5 photos)
    if (photosState.length < 5) {
      const addBtn = document.createElement('div');
      addBtn.className = 'photo-add-card';
      addBtn.setAttribute('title', 'Add restaurant photo');
      addBtn.innerHTML = `<i data-lucide="plus"></i>`;
      addBtn.addEventListener('click', () => {
        photoFileInput.click();
      });
      photosGallery.appendChild(addBtn);
    }

    if (photoCountLabel) {
      photoCountLabel.textContent = `${photosState.length} added (Max 5)`;
    }

    // Handle delete photo clicks
    photosGallery.querySelectorAll('.photo-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        photosState.splice(index, 1);
        persistStep2();
        renderPhotosGallery();
        updateChecklist();
        refreshIcons();
        showToast('Photo Removed', 'Restaurant photo removed.', 'info');
      });
    });
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > MAX_FILE_SIZE) {
          showToast('Image Too Large', 'Please upload a photo under 5 MB.', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          photosState.push({
            id: 'photo_' + Date.now(),
            name: file.name,
            size: file.size,
            dataUrl: event.target.result
          });
          persistStep2();
          renderPhotosGallery();
          updateChecklist();
          refreshIcons();
          showToast('Photo Added', 'Restaurant photo added to gallery.', 'success');
        };
        reader.readAsDataURL(file);
      }
      photoFileInput.value = '';
    });
  }

  // --------------------------------------------------------------------------
  // Dynamic Submission Checklist Updater
  // --------------------------------------------------------------------------
  function updateChecklist() {
    updateChecklistItem('chk-fssai', !!docsState.fssai);
    updateChecklistItem('chk-gst', !!docsState.gst);
    updateChecklistItem('chk-pan', !!docsState.pan);
    updateChecklistItem('chk-cheque', !!docsState.cheque);

    const hasPhotos = photosState.length > 0;
    updateChecklistItem('chk-photos', hasPhotos);
    const photosText = document.getElementById('chk-photos-text');
    if (photosText) {
      photosText.textContent = `Restaurant photos (${photosState.length} added)`;
    }
  }

  function updateChecklistItem(elemId, isDone) {
    const item = document.getElementById(elemId);
    if (!item) return;

    const iconSpan = item.querySelector('.checklist-status-icon');
    if (isDone) {
      iconSpan.className = 'checklist-status-icon checklist-icon-done';
      iconSpan.innerHTML = `<i data-lucide="check-circle-2"></i>`;
    } else {
      iconSpan.className = 'checklist-status-icon checklist-icon-pending';
      iconSpan.innerHTML = '';
    }
  }

  function persistStep2() {
    updateYuduStepData('step2', {
      documents: docsState,
      photos: photosState
    });
  }

  // --------------------------------------------------------------------------
  // Demo State Buttons (1-Click Evaluation Helpers)
  // --------------------------------------------------------------------------
  const btnLoadFigma = document.getElementById('btn-load-figma-state');
  const btnLoadAll = document.getElementById('btn-load-all-docs');

  if (btnLoadFigma) {
    btnLoadFigma.addEventListener('click', () => {
      docsState = JSON.parse(JSON.stringify(figmaDemoDocs));
      photosState = JSON.parse(JSON.stringify(figmaDemoPhotos));
      persistStep2();
      renderAllDocuments();
      showToast('Figma State Loaded', 'FSSAI & GST uploaded, PAN & Cheque pending.', 'info');
    });
  }

  if (btnLoadAll) {
    btnLoadAll.addEventListener('click', () => {
      docsState = {
        fssai: { name: 'fssai_license.pdf', size: 1.2 * 1024 * 1024, sizeFormatted: '1.2 MB', type: 'application/pdf' },
        gst: { name: 'gst_certificate.pdf', size: 860 * 1024, sizeFormatted: '860 KB', type: 'application/pdf' },
        pan: { name: 'pan_card_biryani_factory.jpg', size: 1.4 * 1024 * 1024, sizeFormatted: '1.4 MB', type: 'image/jpeg' },
        cheque: { name: 'cancelled_cheque_hdfc.pdf', size: 720 * 1024, sizeFormatted: '720 KB', type: 'application/pdf' }
      };
      if (photosState.length === 0) {
        photosState = JSON.parse(JSON.stringify(figmaDemoPhotos));
      }
      persistStep2();
      renderAllDocuments();
      showToast('All Documents Verified', 'All 4 verification documents and photos are ready!', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Save As Draft Action
  // --------------------------------------------------------------------------
  const btnSaveDraft = document.getElementById('btn-save-draft-step2');
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', () => {
      persistStep2();
      showToast('Draft Saved', 'Verification documents and photo progress saved locally.', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Submit for Verification & Continue Actions (Advance to Step 3)
  // --------------------------------------------------------------------------
  function advanceToStep3(buttonElement) {
    // If any document or photo is missing in this prototype demo, populate sample records
    if (!docsState.fssai) {
      docsState.fssai = { name: 'fssai_license.pdf', size: 1.2 * 1024 * 1024, sizeFormatted: '1.2 MB', type: 'application/pdf' };
    }
    if (!docsState.gst) {
      docsState.gst = { name: 'gst_certificate.pdf', size: 860 * 1024, sizeFormatted: '860 KB', type: 'application/pdf' };
    }
    if (!docsState.pan) {
      docsState.pan = { name: 'pan_card_biryani_factory.jpg', size: 1.4 * 1024 * 1024, sizeFormatted: '1.4 MB', type: 'image/jpeg' };
    }
    if (!docsState.cheque) {
      docsState.cheque = { name: 'cancelled_cheque_hdfc.pdf', size: 720 * 1024, sizeFormatted: '720 KB', type: 'application/pdf' };
    }
    if (!photosState || photosState.length === 0) {
      photosState = JSON.parse(JSON.stringify(figmaDemoPhotos));
    }

    if (buttonElement) {
      buttonElement.classList.add('loading');
      buttonElement.disabled = true;
    }

    updateYuduStepData('step2', {
      documents: docsState,
      photos: photosState,
      isCompleted: true
    });

    showToast('Documents Saved', 'Advancing to Step 3: Review & Go Live...', 'success');

    setTimeout(() => {
      window.location.href = 'register-step3.html';
    }, 400);
  }

  const btnSubmit = document.getElementById('btn-submit-step2');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      advanceToStep3(btnSubmit);
    });
  }

  const btnContinue = document.getElementById('btn-continue-step2');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      advanceToStep3(btnContinue);
    });
  }

  // --------------------------------------------------------------------------
  // Support Modal
  // --------------------------------------------------------------------------
  const supportLink = document.getElementById('nav-support-link');
  const supportModal = document.getElementById('support-modal');
  const btnCloseSupport = document.getElementById('btn-close-support');
  const btnDismissSupport = document.getElementById('btn-dismiss-support');

  if (supportLink && supportModal) {
    supportLink.addEventListener('click', (e) => {
      e.preventDefault();
      supportModal.classList.add('active');
    });
  }

  const closeSupportModal = () => {
    if (supportModal) supportModal.classList.remove('active');
  };

  if (btnCloseSupport) btnCloseSupport.addEventListener('click', closeSupportModal);
  if (btnDismissSupport) btnDismissSupport.addEventListener('click', closeSupportModal);

  // Initial render
  renderAllDocuments();
});
