
const img1Input = document.getElementById('img1');
const img2Input = document.getElementById('img2');
const img1Preview = document.getElementById('img1-preview');
const img2Preview = document.getElementById('img2-preview');
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const addMoreBtn = document.getElementById('addMoreBtn');

let baseWidth = 0, baseHeight = 0;

img1Input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.size > 3 * 1024 * 1024) {
    alert("Please upload an image smaller than 3MB.");
    return;
  }
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

img2Input.addEventListener('change', (e) => {
  const files = e.target.files;
  const currentCount = img2Preview.querySelectorAll('.image-preview').length;
  if (currentCount + files.length > 6) {
    alert("You can only upload up to 6 images.");
    return;
  }

  Array.from(files).forEach(file => {
    if (file.size > 3 * 1024 * 1024) {
      alert(`${file.name} is too large. Max allowed size is 3MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      displayImage(img2Preview, event.target.result, true);
      toggleUploadButtons();
    };
    reader.readAsDataURL(file);
  });
});

function displayImage(container, src, showDownloadBtn) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('image-preview');
  wrapper.setAttribute('data-converted', 'false');

  const img = new Image();
  img.src = src;

  img.onload = () => {
    const btns = document.createElement('div');
    btns.classList.add('btns');

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '❌';
    removeBtn.onclick = () => {
      wrapper.remove();
      if (!showDownloadBtn) {
        baseWidth = 0;
        baseHeight = 0;
        img1Input.value = '';
      }
      toggleUploadButtons();
    };
    btns.appendChild(removeBtn);

    if (showDownloadBtn) {
      const downloadBtn = document.createElement('button');
      downloadBtn.innerHTML = '⬇️';
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'converted-image.jpg';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Remove image after download
        wrapper.remove();
        toggleUploadButtons();
      };
      btns.appendChild(downloadBtn);
    }

    wrapper.appendChild(img);
    wrapper.appendChild(btns);
    container.appendChild(wrapper);
  };
}

function toggleUploadButtons() {
  const count = img2Preview.querySelectorAll('.image-preview').length;
  if (count >= 6) {
    uploadImagesBtn.classList.add('hidden');
    addMoreBtn.classList.add('hidden');
  } else if (count > 0) {
    uploadImagesBtn.classList.add('hidden');
    addMoreBtn.classList.remove('hidden');
  } else {
    uploadImagesBtn.classList.remove('hidden');
    addMoreBtn.classList.add('hidden');
  }
}

function convertAll() {
  if (baseWidth === 0 || baseHeight === 0) {
    alert("Please upload the first image to set the target dimensions.");
    return;
  }

  const previews = img2Preview.querySelectorAll('.image-preview');
  previews.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    const ctx = canvas.getContext('2d');

    const tempImg = new Image();
    tempImg.onload = () => {
      ctx.drawImage(tempImg, 0, 0, baseWidth, baseHeight);
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 1.0);
      img.src = resizedDataUrl;

      wrapper.setAttribute('data-converted', 'true');

      // Add green checkmark
      if (!wrapper.querySelector('.checkmark')) {
        const checkmark = document.createElement('div');
        checkmark.classList.add('checkmark');
        checkmark.innerHTML = '✅';
        checkmark.style.position = 'absolute';
        checkmark.style.top = '5px';
        checkmark.style.left = '5px';
        checkmark.style.fontSize = '18px';
        wrapper.appendChild(checkmark);
      }

      showToast("Image converted successfully!");
    };
    tempImg.src = img.src;
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerHTML = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  toggleUploadButtons();
});
