// 🔐 Google API Config
const GOOGLE_API_KEY = "AIzaSyBMYhCs8CDxro2t7GyV6hdLV29sVPhRmj8";
const GOOGLE_CX = "f7212cb6befed4bd1";

// 🌐 Google Image Search API Call
async function searchGoogleImages(query) {
  const endpoint = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.items && data.items.length ? data.items[0].link : null;
  } catch (error) {
    console.error("Google API Error:", error);
    return null;
  }
}

// 🔗 Element References
const img1Input = document.getElementById('img1');
const img2Input = document.getElementById('img2');
const imageUrlInput = document.getElementById('imageUrl');
const submitUrlBtn = document.getElementById('submitUrl');
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const img1Preview = document.getElementById('img1-preview');
const img2Preview = document.getElementById('img2-preview');
const toast = document.getElementById('toast');

let baseWidth = 0, baseHeight = 0;

// 📥 Upload Base Image
img1Input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.size > 3 * 1024 * 1024) return alert("Upload image under 3MB.");

  const reader = new FileReader();
  reader.onload = (event) => {
    img1Preview.innerHTML = '';
    const img = new Image();
    img.onload = () => {
      baseWidth = img.width;
      baseHeight = img.height;
      displayImage(img1Preview, img.src, false);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 📥 Upload Multiple from File to Holder 2
img2Input.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const currentCount = getCurrentImageCount();

  if (currentCount + files.length > 6) return alert("Only 6 images allowed.");

  files.forEach(file => {
    if (file.size > 3 * 1024 * 1024) return alert(`${file.name} exceeds 3MB limit.`);

    const reader = new FileReader();
    reader.onload = (event) => {
      displayImage(img2Preview, event.target.result, true);
    };
    reader.readAsDataURL(file);
  });
});

// 🌐 Upload from URL or Keyword
submitUrlBtn.addEventListener('click', async () => {
  const input = imageUrlInput.value.trim();
  if (!input) return alert("Enter an image keyword or URL.");

  if (getCurrentImageCount() >= 6) return alert("Maximum of 6 images reached.");

  submitUrlBtn.innerText = "Processing...";
  submitUrlBtn.disabled = true;

  let imageUrl = input;

  const isURL = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(input);
  if (!isURL) {
    imageUrl = await searchGoogleImages(input);
    if (!imageUrl) return resetSubmitBtn("No image found.");
  }

  try {
    const isValid = await validateImageURL(imageUrl);
    if (isValid) {
      displayImage(img2Preview, imageUrl, true);
      showToast("Image added!");
    } else {
      alert("Invalid image or failed to load.");
    }
  } catch (err) {
    console.error("Image load failed:", err);
    alert("Image load failed. Try a different link.");
  }

  imageUrlInput.value = '';
  resetSubmitBtn();
});

// 🧪 Validate Browser Image URL
async function validateImageURL(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url + (url.includes('?') ? '&' : '?') + 'cache_bust=' + Date.now();
  });
}

// 📸 Display Image with Controls
function displayImage(container, src, showDownload = true) {
  const wrapper = document.createElement('div');
  wrapper.className = 'image-preview';
  wrapper.setAttribute('data-converted', 'false');

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;

  img.onload = () => {
    const btns = document.createElement('div');
    btns.className = 'btns';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.onclick = () => {
      wrapper.remove();
      if (!showDownload) {
        img1Input.value = '';
        baseWidth = 0;
        baseHeight = 0;
      }
      toggleUploadButtons();
    };
    btns.appendChild(removeBtn);

    if (showDownload) {
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = '⬇';
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'converted.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        wrapper.remove();
        toggleUploadButtons();
      };
      btns.appendChild(downloadBtn);
    }

    wrapper.appendChild(img);
    wrapper.appendChild(btns);
    container.appendChild(wrapper);
    toggleUploadButtons();
  };
}

// 🔁 Resize All to Base Image
function convertAll() {
  if (baseWidth === 0 || baseHeight === 0) return alert("Upload base image first.");

  const previews = img2Preview.querySelectorAll('.image-preview');

  previews.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    const ctx = canvas.getContext('2d');

    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.onload = () => {
      try {
        ctx.drawImage(tempImg, 0, 0, baseWidth, baseHeight);
        img.src = canvas.toDataURL('image/jpeg', 1.0);
        wrapper.setAttribute('data-converted', 'true');

        if (!wrapper.querySelector('.checkmark')) {
          const check = document.createElement('div');
          check.className = 'checkmark';
          check.textContent = '✔';
          wrapper.appendChild(check);
        }

        showToast("Image converted!");
      } catch (err) {
        console.error("Resize error:", err);
        showToast("Conversion failed!");
      }
    };
    tempImg.src = img.src;
  });
}

// 🎉 Toast Notification
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2500);
}

// 🔁 Reset Upload Button Text
function resetSubmitBtn(msg = "Add") {
  submitUrlBtn.innerText = msg;
  setTimeout(() => {
    submitUrlBtn.innerText = "Add";
    submitUrlBtn.disabled = false;
  }, 1500);
}

// 🧠 Toggle Upload/Add Button Visibility
function toggleUploadButtons() {
  const count = getCurrentImageCount();
  uploadImagesBtn.classList.toggle('hidden', count >= 6);
  addMoreBtn.classList.toggle('hidden', count >= 6 || count === 0);
}

// ➕ Add More Button
addMoreBtn.addEventListener('click', () => {
  uploadImagesBtn.classList.remove('hidden');
  addMoreBtn.classList.add('hidden');
});

// 🔢 Get Total Images in Holder
function getCurrentImageCount() {
  return img2Preview.querySelectorAll('.image-preview').length;
}

// 🚀 Init on Load
toggleUploadButtons();
// 🧲 Drag-and-Drop Functionality
const dropArea = document.getElementById('dropArea');

// Prevent default behavior
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => e.preventDefault());
  dropArea.addEventListener(eventName, e => e.stopPropagation());
});

// Highlight on drag
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'));
});
['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'));
});

// Handle drop
dropArea.addEventListener('drop', async (e) => {
  const items = e.dataTransfer.items;
  const files = e.dataTransfer.files;
  const currentCount = getCurrentImageCount();

  // Prioritize file drops
  if (files.length && currentCount < 6) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (getCurrentImageCount() < 6) {
            displayImage(img2Preview, event.target.result, true);
            showToast("Image dropped!");
          } else {
            alert("Maximum 6 images allowed.");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    // Handle browser image URLs
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'string' && item.type === 'text/uri-list') {
        item.getAsString(async (url) => {
          if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) {
            return showToast("Not a valid image URL.");
          }
          if (getCurrentImageCount() >= 6) return alert("Image limit reached.");
          const isValid = await validateImageURL(url);
          if (isValid) {
            displayImage(img2Preview, url, true);
            showToast("Image added from browser!");
          } else {
            showToast("Invalid image URL dropped.");
          }
        });
      }
    }
  }
});
