/**
 * YUDU Restaurant Partner Portal - Login Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Password View
  const passwordView = document.getElementById('password-login-view');
  const otpView = document.getElementById('otp-login-view');
  const loginForm = document.getElementById('login-form');
  const identifierInput = document.getElementById('login-identifier');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const togglePasswordIcon = document.getElementById('toggle-password-icon');
  const btnLoginSubmit = document.getElementById('btn-login-submit');
  const btnSwitchOtp = document.getElementById('btn-switch-otp');
  const btnQuickFill = document.getElementById('btn-quick-fill');

  // Elements - OTP View
  const otpForm = document.getElementById('otp-form');
  const otpMobileInput = document.getElementById('otp-mobile-input');
  const otpCodeSection = document.getElementById('otp-code-section');
  const btnRequestOtp = document.getElementById('btn-request-otp');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const btnResendOtp = document.getElementById('btn-resend-otp');
  const countdownSeconds = document.getElementById('countdown-seconds');
  const otpBoxes = document.querySelectorAll('.otp-box');
  const btnBackPassword = document.getElementById('btn-back-password');

  // Elements - Forgot Password Modal
  const forgotModal = document.getElementById('forgot-modal');
  const forgotLink = document.getElementById('forgot-password-link');
  const btnCloseForgot = document.getElementById('btn-close-forgot');
  const forgotForm = document.getElementById('forgot-form');

  let otpTimerInterval = null;

  const EYE_SVG = `<svg class="eye-icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const EYE_OFF_SVG = `<svg class="eye-icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;

  function syncPasswordToggle() {
    if (!togglePasswordBtn || !passwordInput) return;
    const isShowing = passwordInput.type === 'text';
    togglePasswordBtn.innerHTML = isShowing ? EYE_OFF_SVG : EYE_SVG;
    togglePasswordBtn.setAttribute('aria-label', isShowing ? 'Hide password' : 'Show password');
    togglePasswordBtn.setAttribute('title', isShowing ? 'Hide password' : 'Show password');
  }

  // --------------------------------------------------------------------------
  // Password Visibility Toggle
  // --------------------------------------------------------------------------
  if (togglePasswordBtn && passwordInput) {
    // Ensure initial sync
    syncPasswordToggle();

    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentlyHidden = passwordInput.type === 'password';
      passwordInput.type = currentlyHidden ? 'text' : 'password';
      syncPasswordToggle();

      // Keep focus on input so user can keep typing
      passwordInput.focus();
    });
  }

  // --------------------------------------------------------------------------
  // Quick Auto-Fill Demo Credentials
  // --------------------------------------------------------------------------
  if (btnQuickFill) {
    btnQuickFill.addEventListener('click', () => {
      identifierInput.value = 'partner@biryanifactory.in';
      passwordInput.value = 'PartnerPass@123';
      clearErrors();
      showToast('Demo Credentials Loaded', 'Sample restaurant partner credentials populated.', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Password Login Submission & Validation
  // --------------------------------------------------------------------------
  function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const identifier = identifierInput.value.trim();
      const password = passwordInput.value;

      let isValid = true;

      // Validate email or mobile
      const isEmail = isValidEmail(identifier);
      const isMobile = isValidMobile(identifier);

      if (!identifier || (!isEmail && !isMobile)) {
        document.getElementById('group-identifier').classList.add('has-error');
        identifierInput.classList.add('error');
        isValid = false;
      }

      // Validate password
      if (!password || password.length < 6) {
        document.getElementById('group-password').classList.add('has-error');
        passwordInput.classList.add('error');
        isValid = false;
      }

      if (!isValid) return;

      // Loading State
      btnLoginSubmit.classList.add('loading');
      btnLoginSubmit.disabled = true;

      setTimeout(() => {
        btnLoginSubmit.classList.remove('loading');
        btnLoginSubmit.disabled = false;

        // Persist partner authentication state
        localStorage.setItem('yudu_partner_logged_in', 'true');
        localStorage.setItem('yudu_partner_session', JSON.stringify({
          identifier: identifier,
          role: 'Restaurant Partner',
          loginTime: new Date().toISOString()
        }));

        showToast('Login Successful!', 'Welcome back to YUDU Partner Portal. Redirecting to admin dashboard...', 'success');

        // Redirect directly to the Admin Page as requested
        setTimeout(() => {
          window.location.href = 'index.html#home';
        }, 1000);

      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // OTP Flow Switching & Interactions
  // --------------------------------------------------------------------------
  if (btnSwitchOtp) {
    btnSwitchOtp.addEventListener('click', () => {
      passwordView.classList.add('hidden');
      otpView.classList.add('active');
      refreshIcons();
    });
  }

  if (btnBackPassword) {
    btnBackPassword.addEventListener('click', () => {
      otpView.classList.remove('active');
      passwordView.classList.remove('hidden');
      clearInterval(otpTimerInterval);
      refreshIcons();
    });
  }

  // Request OTP
  if (btnRequestOtp) {
    btnRequestOtp.addEventListener('click', () => {
      const mobile = otpMobileInput.value.trim();
      if (!isValidMobile(mobile)) {
        document.getElementById('group-otp-mobile').classList.add('has-error');
        otpMobileInput.classList.add('error');
        return;
      }

      document.getElementById('group-otp-mobile').classList.remove('has-error');
      otpMobileInput.classList.remove('error');

      btnRequestOtp.classList.add('loading');
      btnRequestOtp.disabled = true;

      setTimeout(() => {
        btnRequestOtp.classList.remove('loading');
        btnRequestOtp.style.display = 'none';
        btnVerifyOtp.style.display = 'inline-flex';
        otpCodeSection.style.display = 'block';

        showToast('OTP Sent!', 'A 6-digit OTP has been sent to ' + mobile + '. (Demo: 123456)', 'info');

        // Focus first OTP box
        if (otpBoxes.length > 0) otpBoxes[0].focus();

        startOtpTimer();
      }, 800);
    });
  }

  function startOtpTimer() {
    clearInterval(otpTimerInterval);
    let secondsLeft = 30;
    btnResendOtp.disabled = true;
    countdownSeconds.parentElement.style.display = 'inline';

    countdownSeconds.textContent = secondsLeft;

    otpTimerInterval = setInterval(() => {
      secondsLeft--;
      countdownSeconds.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(otpTimerInterval);
        btnResendOtp.disabled = false;
        countdownSeconds.parentElement.style.display = 'none';
      }
    }, 1000);
  }

  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      showToast('OTP Resent', 'A new 6-digit code was sent to your phone. (Demo: 123456)', 'info');
      startOtpTimer();
    });
  }

  // OTP Box inputs auto-focus / backspace / paste
  otpBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      box.value = val ? val[0] : '';
      if (val && index < otpBoxes.length - 1) {
        otpBoxes[index + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        otpBoxes[index - 1].focus();
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if (pasteData) {
        for (let i = 0; i < otpBoxes.length && i < pasteData.length; i++) {
          otpBoxes[i].value = pasteData[i];
        }
        const nextIndex = Math.min(pasteData.length, otpBoxes.length - 1);
        otpBoxes[nextIndex].focus();
      }
    });
  });

  // Verify OTP
  if (otpForm) {
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let enteredCode = '';
      otpBoxes.forEach(b => enteredCode += b.value);

      if (enteredCode.length !== 6) {
        showToast('Invalid OTP', 'Please enter all 6 digits of the OTP code.', 'error');
        return;
      }

      btnVerifyOtp.classList.add('loading');
      btnVerifyOtp.disabled = true;

      setTimeout(() => {
        btnVerifyOtp.classList.remove('loading');
        btnVerifyOtp.disabled = false;

        // Persist partner authentication state
        localStorage.setItem('yudu_partner_logged_in', 'true');
        localStorage.setItem('yudu_partner_session', JSON.stringify({
          identifier: otpMobileInput.value.trim(),
          role: 'Restaurant Partner',
          loginTime: new Date().toISOString()
        }));

        showToast('OTP Verified!', 'Successfully authenticated via phone. Redirecting to admin dashboard...', 'success');

        // Redirect directly to the Admin Page as requested
        setTimeout(() => {
          window.location.href = 'index.html#home';
        }, 1000);

      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // Forgot Password Modal
  // --------------------------------------------------------------------------
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('active');
    });
  }

  if (btnCloseForgot && forgotModal) {
    btnCloseForgot.addEventListener('click', () => {
      forgotModal.classList.remove('active');
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputVal = document.getElementById('forgot-input').value.trim();
      if (!inputVal) return;

      forgotModal.classList.remove('active');
      showToast('Instructions Sent', 'Password reset instructions have been dispatched to ' + inputVal, 'success');
      document.getElementById('forgot-input').value = '';
    });
  }

});
