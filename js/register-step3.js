/**
 * YUDU Restaurant Partner Portal - Register Step 3 (Review & Go Live) Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentData = getYuduData();
  const step1 = currentData.step1 || {};
  const step2 = currentData.step2 || {};
  const docs = step2.documents || {};
  const photos = step2.photos || [];

  // Fallback defaults if opened directly without completing previous steps
  const fallbackStep1 = {
    restaurantName: 'Biryani Factory',
    ownerName: 'Dawan Bhai',
    mobileNumber: '+91 98765 43210',
    businessEmail: 'owner@biryanifactory.in',
    cuisines: ['Biryani', 'North Indian'],
    address: '12-4, RTC Cross roads , Hyderabad',
    city: 'Hyderabad',
    pincode: '500001',
    opensAt: '10:00 AM',
    closesAt: '11:00 PM'
  };

  const finalStep1 = {
    restaurantName: step1.restaurantName || fallbackStep1.restaurantName,
    ownerName: step1.ownerName || fallbackStep1.ownerName,
    mobileNumber: step1.mobileNumber || fallbackStep1.mobileNumber,
    businessEmail: step1.businessEmail || fallbackStep1.businessEmail,
    cuisines: (Array.isArray(step1.cuisines) && step1.cuisines.length > 0) ? step1.cuisines : fallbackStep1.cuisines,
    address: step1.address || fallbackStep1.address,
    city: step1.city || fallbackStep1.city,
    pincode: step1.pincode || fallbackStep1.pincode,
    opensAt: step1.opensAt || fallbackStep1.opensAt,
    closesAt: step1.closesAt || fallbackStep1.closesAt
  };

  // --------------------------------------------------------------------------
  // Populate Card 1: Restaurant Details
  // --------------------------------------------------------------------------
  document.getElementById('val-restaurant-name').textContent = finalStep1.restaurantName;
  document.getElementById('val-owner-name').textContent = finalStep1.ownerName;
  document.getElementById('val-mobile-number').textContent = finalStep1.mobileNumber;
  document.getElementById('val-business-email').textContent = finalStep1.businessEmail;
  document.getElementById('val-address').textContent = finalStep1.address;
  document.getElementById('val-city-pincode').textContent = `${finalStep1.city} - ${finalStep1.pincode}`;
  document.getElementById('val-operating-hours').textContent = `${finalStep1.opensAt} – ${finalStep1.closesAt}`;

  const cuisinesWrap = document.getElementById('val-cuisines');
  if (cuisinesWrap) {
    cuisinesWrap.innerHTML = '';
    finalStep1.cuisines.forEach(c => {
      const tag = document.createElement('span');
      tag.className = 'cuisine-tag';
      tag.textContent = c;
      cuisinesWrap.appendChild(tag);
    });
  }

  // --------------------------------------------------------------------------
  // Populate Card 2: Verification Documents
  // --------------------------------------------------------------------------
  const reviewDocsList = document.getElementById('review-docs-list');
  const docLabels = {
    fssai: 'FSSAI License',
    gst: 'GST Certificate',
    pan: 'PAN Card',
    cheque: 'Cancelled Cheque / Bank Proof'
  };

  const fallbackDocs = {
    fssai: { name: 'fssai_license.pdf', sizeFormatted: '1.2 MB' },
    gst: { name: 'gst_certificate.pdf', sizeFormatted: '860 KB' },
    pan: { name: 'pan_card.jpg', sizeFormatted: '1.4 MB' },
    cheque: { name: 'cancelled_cheque.pdf', sizeFormatted: '720 KB' }
  };

  if (reviewDocsList) {
    reviewDocsList.innerHTML = '';
    Object.keys(docLabels).forEach(key => {
      const doc = docs[key] || fallbackDocs[key];
      const div = document.createElement('div');
      div.className = 'review-doc-item';
      div.innerHTML = `
        <div class="doc-icon-container" style="width: 36px; height: 36px; border-radius: 8px;">
          <i data-lucide="file-check"></i>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <strong style="font-size: 0.88rem; color: var(--main-text);">${docLabels[key]}</strong>
          <span style="font-size: 0.78rem; color: var(--secondary-text);">${doc ? (doc.name + ' · ' + (doc.sizeFormatted || 'Uploaded')) : 'Pending upload'}</span>
        </div>
        <span class="badge badge-success">✓ Ready</span>
      `;
      reviewDocsList.appendChild(div);
    });
  }

  // --------------------------------------------------------------------------
  // Populate Card 3: Photos Gallery
  // --------------------------------------------------------------------------
  const reviewPhotosGrid = document.getElementById('review-photos-grid');
  const reviewPhotosTitle = document.getElementById('review-photos-title');
  const finalPhotos = photos.length > 0 ? photos : [
    { style: 'style-yellow' },
    { style: 'style-orange' },
    { style: 'style-coral' }
  ];

  if (reviewPhotosTitle) {
    reviewPhotosTitle.textContent = `Restaurant Photos (${finalPhotos.length} uploaded)`;
  }

  if (reviewPhotosGrid) {
    reviewPhotosGrid.innerHTML = '';
    finalPhotos.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = `photo-thumb-card ${photo.style || 'style-purple'}`;
      if (photo.dataUrl) {
        card.innerHTML = `<img src="${photo.dataUrl}" alt="Photo ${idx + 1}">`;
      } else {
        card.innerHTML = `<div class="photo-placeholder-icon"><i data-lucide="utensils"></i></div>`;
      }
      reviewPhotosGrid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // Terms Confirmation & Submit Interaction
  // --------------------------------------------------------------------------
  const termsCheckbox = document.getElementById('terms-checkbox');
  const errorTerms = document.getElementById('error-terms');
  const btnFinalSubmit = document.getElementById('btn-final-submit');
  const reviewContainer = document.getElementById('review-form-container');
  const successView = document.getElementById('submission-success-view');
  const reviewHeaderRow = document.getElementById('review-header-row');
  const reviewStepBar = document.getElementById('review-step-bar');

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      if (termsCheckbox.checked && errorTerms) {
        errorTerms.style.display = 'none';
      }
    });
  }

  if (btnFinalSubmit) {
    btnFinalSubmit.addEventListener('click', () => {
      if (!termsCheckbox.checked) {
        if (errorTerms) errorTerms.style.display = 'block';
        showToast('Confirmation Required', 'Please accept the declaration checkbox to submit.', 'error');
        return;
      }

      btnFinalSubmit.classList.add('loading');
      btnFinalSubmit.disabled = true;

      // Simulate submission processing
      setTimeout(() => {
        const appRef = 'YUDU-APP-2026-' + Math.floor(10000 + Math.random() * 90000);
        const timestamp = new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' · ' + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Save submitted state to localStorage
        updateYuduStepData('step3', {
          isConfirmed: true,
          applicationRef: appRef,
          submittedAt: timestamp,
          status: 'Pending Verification'
        });

        // Notify admin dashboard in real-time
        try {
          const syncChannel = new BroadcastChannel('yudu_application_channel');
          syncChannel.postMessage({ type: 'application_submitted', ref: appRef, timestamp: timestamp });
        } catch (e) {}

        // Populate success view details
        document.getElementById('success-ref-num').textContent = appRef;
        document.getElementById('success-restaurant-name').textContent = `${finalStep1.restaurantName}, ${finalStep1.city}`;
        document.getElementById('success-timestamp').textContent = timestamp;

        // Transition UI to Success Screen
        reviewContainer.style.display = 'none';
        reviewHeaderRow.style.display = 'none';
        reviewStepBar.style.display = 'none';
        successView.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
        refreshIcons();

        showToast('Application Submitted!', 'Your partner registration has been successfully placed.', 'success');
      }, 1200);
    });
  }

  // --------------------------------------------------------------------------
  // Print & Reset Actions
  // --------------------------------------------------------------------------
  const btnPrint = document.getElementById('btn-print-summary');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnReset = document.getElementById('btn-reset-demo');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Start a fresh partner registration? This will clear local demo data.')) {
        clearYuduData();
        showToast('Reset Complete', 'Demo data cleared. Redirecting...', 'info');
        setTimeout(() => {
          window.location.href = 'partner-login.html';
        }, 800);
      }
    });
  }

  // Support Modal
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

  refreshIcons();
});
