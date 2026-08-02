// Configure your Google Sheets API Web App URL here
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXPEQ2x5jFk_kKbGtw2iQyfUab1VvU-S65UEQp7cp9PNZyyM49mq2XM2Cv0lKEgAFk/exec";

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. NEURAL NET CANVAS BACKGROUND
  // ==========================================
  const canvas = document.getElementById('cyber-grid-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.3 ? 'rgba(217, 4, 41, 0.35)' : 'rgba(247, 127, 0, 0.35)'; // Crimson or Orange
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 50 }, () => new Particle());

    function animateGrid() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid overlay
      ctx.strokeStyle = 'rgba(217, 4, 41, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw particle nodes
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Connect nodes
      ctx.strokeStyle = 'rgba(217, 4, 41, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateGrid);
    }
    animateGrid();
  }

  // ==========================================
  // 2. STATE CONFIGURATION
  // ==========================================
  let currentStep = 1;
  const totalSteps = 5;

  const state = {
    followClicked: false,
    likertClicked: false,
    quoteClicked: false,
    username: '',
    evmAddress: ''
  };

  // DOM Elements
  const stepElements = document.querySelectorAll('.step-content');
  const progressNodes = document.querySelectorAll('.progress-step-node');
  const progressLineFill = document.getElementById('progress-line-fill');
  const progressBarWrapper = document.getElementById('progress-bar-wrapper');

  // Input & validation elements
  const usernameInput = document.getElementById('x-username');
  const errorUsername = document.getElementById('error-username');
  const addressInput = document.getElementById('evm-address');
  const errorAddress = document.getElementById('error-address');

  // Next / Prev Navigation Buttons
  const btnNext1 = document.getElementById('next-1');
  const btnNext2 = document.getElementById('next-2');
  const btnNext3 = document.getElementById('next-3');
  const btnNext4 = document.getElementById('next-4');
  const btnSubmit = document.getElementById('btn-submit');

  // Check storage on init
  const savedUser = localStorage.getItem('noctix_whitelist_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      showAlreadyRegistered(user.username, user.evmAddress);
      return; // Exit main flow
    } catch (e) {
      localStorage.removeItem('noctix_whitelist_user');
    }
  }

  // ==========================================
  // 3. STEP TRANSITION LOGIC
  // ==========================================
  function updateStepsUI() {
    // Show current step panel, hide others
    stepElements.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      if (stepNum === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update progress steps node state (active/completed)
    progressNodes.forEach(node => {
      const nodeNum = parseInt(node.getAttribute('data-node'));
      node.classList.remove('active', 'completed');
      
      if (nodeNum === currentStep) {
        node.classList.add('active');
      } else if (nodeNum < currentStep) {
        node.classList.add('completed');
      }
    });

    // Update progress bar filler line
    const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    if (progressLineFill) {
      progressLineFill.style.width = `${fillPercent}%`;
    }
  }

  function navigateNext() {
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepsUI();
    }
  }

  function navigatePrev() {
    if (currentStep > 1) {
      currentStep--;
      updateStepsUI();
    }
  }

  // Bind Prev Buttons
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', navigatePrev);
  });

  // Bind Next Buttons
  if (btnNext1) btnNext1.addEventListener('click', navigateNext);
  if (btnNext2) btnNext2.addEventListener('click', navigateNext);
  if (btnNext3) btnNext3.addEventListener('click', navigateNext);
  if (btnNext4) btnNext4.addEventListener('click', navigateNext);

  // ==========================================
  // 4. MOCK LINK-CLICK TASK VALIDATION
  // ==========================================
  function setupLinkTrigger(linkId, statusId, stateProperty, nextButton) {
    const linkEl = document.getElementById(linkId);
    const statusEl = document.getElementById(statusId);
    
    if (linkEl && statusEl) {
      linkEl.addEventListener('click', () => {
        // Only trigger loading sequence if not already verified
        if (!state[stateProperty]) {
          statusEl.className = 'task-status-indicator loading';
          statusEl.querySelector('.status-text').textContent = 'Verifying core...';
          
          // Mimic smart verification with X api
          setTimeout(() => {
            state[stateProperty] = true;
            statusEl.className = 'task-status-indicator success';
            statusEl.querySelector('.status-text').textContent = 'Task Completed';
            
            // Unlock next step
            if (nextButton) {
              nextButton.disabled = false;
            }
          }, 1200);
        }
      });
    }
  }

  setupLinkTrigger('link-follow', 'status-follow', 'followClicked', btnNext1);
  setupLinkTrigger('link-likert', 'status-likert', 'likertClicked', btnNext2);
  setupLinkTrigger('link-quote', 'status-quote', 'quoteClicked', btnNext3);

  // ==========================================
  // 5. INPUT VALIDATIONS (REAL-TIME)
  // ==========================================

  // Username Validation
  function validateUsername(value) {
    let clean = value.trim();
    if (clean === '') return false;
    
    // Must be at least 3 chars (without @) and no spaces
    if (clean.startsWith('@')) {
      clean = clean.slice(1);
    }
    return clean.length >= 3 && !clean.includes(' ');
  }

  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      const val = usernameInput.value;
      const isValid = validateUsername(val);
      
      if (val.trim() !== '' && !isValid) {
        errorUsername.classList.add('active');
        btnNext4.disabled = true;
      } else {
        errorUsername.classList.remove('active');
        if (isValid) {
          btnNext4.disabled = false;
          state.username = val.trim().startsWith('@') ? val.trim() : '@' + val.trim();
        } else {
          btnNext4.disabled = true;
        }
      }
    });

    // Auto prepend @ on blur if missing
    usernameInput.addEventListener('blur', () => {
      let val = usernameInput.value.trim();
      if (val !== '' && !val.startsWith('@') && !val.includes(' ')) {
        usernameInput.value = '@' + val;
      }
    });
  }

  // EVM Address Validation
  function validateEVMAddress(address) {
    const clean = address.trim();
    // Valid standard EVM address regex
    return /^0x[a-fA-F0-9]{40}$/.test(clean);
  }

  if (addressInput) {
    addressInput.addEventListener('input', () => {
      const val = addressInput.value;
      const isValid = validateEVMAddress(val);
      
      if (val.trim() !== '' && !isValid) {
        errorAddress.classList.add('active');
        btnSubmit.disabled = true;
      } else {
        errorAddress.classList.remove('active');
        if (isValid) {
          btnSubmit.disabled = false;
          state.evmAddress = val.trim();
        } else {
          btnSubmit.disabled = true;
        }
      }
    });
  }

  // ==========================================
  // 6. FORM SUBMISSION
  // ==========================================
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      if (!validateUsername(state.username) || !validateEVMAddress(state.evmAddress)) {
        return; // Double check guard
      }

      // Add loading state to button
      btnSubmit.disabled = true;
      const originalText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = `
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <span>Registering Core...</span>
      `;

      const payload = {
        username: state.username,
        evmAddress: state.evmAddress,
        timestamp: new Date().toISOString()
      };

      const completeLocalSubmission = () => {
        // Save to localStorage
        localStorage.setItem('noctix_whitelist_user', JSON.stringify(payload));

        // Update success page receipt
        const summaryUser = document.getElementById('summary-username');
        const summaryAddr = document.getElementById('summary-address');
        if (summaryUser) summaryUser.textContent = payload.username;
        if (summaryAddr) {
          // Shorten address for UI layout
          const addr = payload.evmAddress;
          summaryAddr.textContent = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
          summaryAddr.title = addr;
        }

        // Hide progress bar and nodes
        if (progressBarWrapper) {
          progressBarWrapper.style.display = 'none';
        }

        // Show step 6 (Success)
        currentStep = 6;
        updateStepsUI();
      };

      // Send to Google Sheets if configured
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "") {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Crucial to bypass CORS preflight check on Google Apps Script
          },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            completeLocalSubmission();
          } else {
            alert('Failed to register: ' + (data.message || 'Unknown error'));
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
          }
        })
        .catch(error => {
          console.error('Error submitting to Google Sheets:', error);
          // If there's an error (e.g. CORS block or network loss), still register locally but alert
          alert('Submission error. Please ensure your Google Script URL is configured correctly with the instructions in SETUP_GOOGLE_SHEETS.md.');
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = originalText;
        });
      } else {
        // Fallback for local testing (simulated API write delay)
        setTimeout(() => {
          completeLocalSubmission();
        }, 1500);
      }
    });
  }

  // ==========================================
  // 7. ALREADY REGISTERED INITIALIZER
  // ==========================================
  function showAlreadyRegistered(username, address) {
    // Hide progress wrapper
    if (progressBarWrapper) {
      progressBarWrapper.style.display = 'none';
    }

    // Deactivate all steps
    stepElements.forEach(step => step.classList.remove('active'));

    // Show registered screen
    const regScreen = document.querySelector('[data-step="already-registered"]');
    if (regScreen) {
      regScreen.classList.add('active');
    }

    // Populate registered data
    const regUser = document.getElementById('reg-username');
    const regAddr = document.getElementById('reg-address');
    if (regUser) regUser.textContent = username;
    if (regAddr) {
      regAddr.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
      regAddr.title = address;
    }
  }

});
