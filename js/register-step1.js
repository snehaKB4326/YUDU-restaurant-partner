/**
 * YUDU Restaurant Partner Portal - Register Step 1 (Restaurant Details) Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('step1-form');
  const restaurantNameInput = document.getElementById('restaurant-name');
  const ownerNameInput = document.getElementById('owner-name');
  const mobileInput = document.getElementById('mobile-number');
  const emailInput = document.getElementById('business-email');
  const addressInput = document.getElementById('restaurant-address');
  const citySelect = document.getElementById('restaurant-city');
  const pincodeInput = document.getElementById('restaurant-pincode');
  const opensAtInput = document.getElementById('restaurant-opens-at');
  const closesAtInput = document.getElementById('restaurant-closes-at');
  const cuisinePills = document.querySelectorAll('.cuisine-pill');

  const btnSaveDraft = document.getElementById('btn-save-draft');
  const btnContinue = document.getElementById('btn-continue');
  const btnPrefill = document.getElementById('btn-prefill-step1');

  // --------------------------------------------------------------------------
  // Restore Data from LocalStorage
  // --------------------------------------------------------------------------
  const appData = getYuduData();
  const savedStep1 = appData.step1;

  if (savedStep1) {
    if (savedStep1.restaurantName) restaurantNameInput.value = savedStep1.restaurantName;
    if (savedStep1.ownerName) ownerNameInput.value = savedStep1.ownerName;
    if (savedStep1.mobileNumber) mobileInput.value = savedStep1.mobileNumber;
    if (savedStep1.businessEmail) emailInput.value = savedStep1.businessEmail;
    if (savedStep1.address) addressInput.value = savedStep1.address;
    if (savedStep1.city) citySelect.value = savedStep1.city;
    if (savedStep1.pincode) pincodeInput.value = savedStep1.pincode;
    if (savedStep1.opensAt) opensAtInput.value = savedStep1.opensAt;
    if (savedStep1.closesAt) closesAtInput.value = savedStep1.closesAt;

    if (Array.isArray(savedStep1.cuisines) && savedStep1.cuisines.length > 0) {
      cuisinePills.forEach(pill => {
        const cName = pill.getAttribute('data-cuisine');
        if (savedStep1.cuisines.includes(cName)) {
          pill.classList.add('selected');
        } else {
          pill.classList.remove('selected');
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // Cuisine Pill Toggle Interaction
  // --------------------------------------------------------------------------
  cuisinePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
      const selected = getSelectedCuisines();
      if (selected.length > 0) {
        document.getElementById('group-cuisines').classList.remove('has-error');
      }
    });
  });

  function getSelectedCuisines() {
    const selected = [];
    document.querySelectorAll('.cuisine-pill.selected').forEach(pill => {
      selected.push(pill.getAttribute('data-cuisine'));
    });
    return selected;
  }

  // --------------------------------------------------------------------------
  // Pre-fill Demo Data (Matches Figma screenshot)
  // --------------------------------------------------------------------------
  function applyDemoData() {
    restaurantNameInput.value = 'Biryani Factory';
    ownerNameInput.value = 'Dawan Bhai';
    mobileInput.value = '+91 98765 43210';
    emailInput.value = 'owner@biryanifactory.in';
    addressInput.value = '12-4, RTC Cross roads , Hyderabad';
    citySelect.value = 'Hyderabad';
    pincodeInput.value = '500001';
    opensAtInput.value = '10:00 AM';
    closesAtInput.value = '11:00 PM';

    cuisinePills.forEach(pill => {
      const c = pill.getAttribute('data-cuisine');
      if (c === 'Biryani' || c === 'North Indian') {
        pill.classList.add('selected');
      } else {
        pill.classList.remove('selected');
      }
    });

    clearFormErrors();
    showToast('Figma Demo Loaded', 'Restaurant details loaded matching reference screenshot.', 'success');
  }

  if (btnPrefill) {
    btnPrefill.addEventListener('click', applyDemoData);
  }

  // --------------------------------------------------------------------------
  // Form Field Validation
  // --------------------------------------------------------------------------
  function clearFormErrors() {
    document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
    document.querySelectorAll('.form-input, .form-select').forEach(inp => inp.classList.remove('error'));
  }

  function getFormData() {
    return {
      restaurantName: restaurantNameInput.value.trim(),
      ownerName: ownerNameInput.value.trim(),
      mobileNumber: mobileInput.value.trim(),
      businessEmail: emailInput.value.trim(),
      cuisines: getSelectedCuisines(),
      address: addressInput.value.trim(),
      city: citySelect.value,
      pincode: pincodeInput.value.trim(),
      opensAt: opensAtInput.value.trim(),
      closesAt: closesAtInput.value.trim()
    };
  }

  function validateForm() {
    clearFormErrors();
    const data = getFormData();
    let isValid = true;

    // Restaurant Name
    if (!data.restaurantName) {
      document.getElementById('group-restaurant-name').classList.add('has-error');
      restaurantNameInput.classList.add('error');
      isValid = false;
    }

    // Owner Name
    if (!data.ownerName) {
      document.getElementById('group-owner-name').classList.add('has-error');
      ownerNameInput.classList.add('error');
      isValid = false;
    }

    // Mobile Number
    if (!isValidMobile(data.mobileNumber)) {
      document.getElementById('group-mobile-number').classList.add('has-error');
      mobileInput.classList.add('error');
      isValid = false;
    }

    // Business Email
    if (!isValidEmail(data.businessEmail)) {
      document.getElementById('group-business-email').classList.add('has-error');
      emailInput.classList.add('error');
      isValid = false;
    }

    // Cuisines
    if (data.cuisines.length === 0) {
      document.getElementById('group-cuisines').classList.add('has-error');
      isValid = false;
    }

    // Address
    if (!data.address) {
      document.getElementById('group-address').classList.add('has-error');
      addressInput.classList.add('error');
      isValid = false;
    }

    // City
    if (!data.city) {
      document.getElementById('group-city').classList.add('has-error');
      citySelect.classList.add('error');
      isValid = false;
    }

    // Pincode
    if (!isValidPincode(data.pincode)) {
      document.getElementById('group-pincode').classList.add('has-error');
      pincodeInput.classList.add('error');
      isValid = false;
    }

    // Opens At
    if (!data.opensAt) {
      document.getElementById('group-opens-at').classList.add('has-error');
      opensAtInput.classList.add('error');
      isValid = false;
    }

    // Closes At
    if (!data.closesAt) {
      document.getElementById('group-closes-at').classList.add('has-error');
      closesAtInput.classList.add('error');
      isValid = false;
    }

    return { isValid, data };
  }

  // --------------------------------------------------------------------------
  // Save as Draft Action
  // --------------------------------------------------------------------------
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', () => {
      const formData = getFormData();
      updateYuduStepData('step1', {
        ...formData,
        isCompleted: false
      });
      showToast('Draft Saved', 'Your restaurant information has been saved locally.', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Continue Action (Submit)
  // --------------------------------------------------------------------------
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { isValid, data } = validateForm();

      if (!isValid) {
        showToast('Incomplete Details', 'Please fill in all required fields accurately.', 'error');
        // Scroll to first error
        const firstErr = document.querySelector('.form-group.has-error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Save to localStorage with isCompleted = true
      updateYuduStepData('step1', {
        ...data,
        isCompleted: true
      });

      btnContinue.classList.add('loading');
      btnContinue.disabled = true;

      setTimeout(() => {
        window.location.href = 'register-step2.html';
      }, 500);
    });
  }

});
