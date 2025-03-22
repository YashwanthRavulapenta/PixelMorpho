// 🔐 Google API Config
const GOOGLE_API_KEY = "AIzaSyBMYhCs8CDxro2t7GyV6hdLV29sVPhRmj8";
const GOOGLE_CX = "f7212cb6befed4bd1";

// 🌐 Google Image Search
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

// 🔍 Display Image Utility
function displayImage(container, src, showDownload = true) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('image-preview');
  wrapper.setAttribute('data-converted', 'false');

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;

  img.onload = () => {
    const btns = document.createElement('div');
    btns.classList.add('btns');

    const removeBtn = document.createElement('button');
    removeBtn.innerText = '❌';
    removeBtn.onclick = () => {
      wrapper.remove();
      if (!showDownload) {
        baseWidth = 0;
        baseHeight = 0;
        img1Input.value = '';
      }
      toggleUploadButtons();
    };
    btns.appendChild(removeBtn);

    if (showDownload) {
      const downloadBtn = document.createElement('button');
      downloadBtn.innerText = '⬇';
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'converted-image.jpg';
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

// 📥 Upload First Base Image
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

// 📥 Upload Multiple to Second Holder
img2Input.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const currentCount = img2Preview.querySelectorAll('.image-preview').length;

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

// 🌐 Upload via Keyword or URL
submitUrlBtn.addEventListener('click', async () => {
  const query = imageUrlInput.value.trim();
  if (!query) return alert("Please enter a keyword or URL.");

  submitUrlBtn.innerText = "Searching...";
  submitUrlBtn.disabled = true;

  const imageUrl = await searchGoogleImages(query);
  if (imageUrl) {
    displayImage(img2Preview, imageUrl, true);
  } else {
    alert("No image found.");
  }

  imageUrlInput.value = '';
  submitUrlBtn.innerText = "Upload from URL";
  submitUrlBtn.disabled = false;
});

// 🔁 Toggle Upload & Add More Buttons
function toggleUploadButtons() {
  const count = img2Preview.querySelectorAll('.image-preview').length;
  uploadImagesBtn.classList.toggle('hidden', count >= 6);
  addMoreBtn.classList.toggle('hidden', count >= 6 || count === 0);
}

// ⚙️ Convert All to Base Size
function convertAll() {
  if (baseWidth === 0 || baseHeight === 0) return alert("Please upload base image first.");

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
        const resized = canvas.toDataURL('image/jpeg', 1.0);
        img.src = resized;
        wrapper.setAttribute('data-converted', 'true');

        if (!wrapper.querySelector('.checkmark')) {
          const check = document.createElement('div');
          check.classList.add('checkmark');
          check.innerText = '✔';
          wrapper.appendChild(check);
        }

        showToast("Image converted!");
      } catch (err) {
        console.error("Error resizing:", err);
        showToast("Conversion failed!");
      }
    };

    tempImg.src = img.src;
  });
}

// 🎉 Toast Notification
function showToast(msg) {
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2500);
}

// ➕ Add More Button Logic
addMoreBtn.addEventListener('click', () => {
  uploadImagesBtn.classList.remove('hidden');
  addMoreBtn.classList.add('hidden');
});

// 🧠 Init
toggleUploadButtons();
