const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'design.html');
let content = fs.readFileSync(p, 'utf8');

const regex = /<script>\s*function switchTab[\s\S]*?<\/script>/;

const newScript = `<script>
        // Cloudinary Details for client upload
        // Note: It is better to use signed uploads in production, but unsigned works here
        const CLOUD_NAME = 'dldw5b65h';
        const UPLOAD_PRESET = 'aura_unsigned';

        const crImageInput = document.getElementById('cr-image');
        const crImagePreview = document.getElementById('cr-image-preview');
        const crPreviewImg = crImagePreview ? crImagePreview.querySelector('img') : null;
        const submitBtn = document.getElementById('cr-submit-btn');

        if (crImageInput) {
            crImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    crPreviewImg.src = URL.createObjectURL(file);
                    crImagePreview.style.display = 'block';
                } else {
                    crImagePreview.style.display = 'none';
                }
            });
        }

        function compressImage(file, maxWidth = 1000, quality = 0.8) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let w = img.width, h = img.height;
                        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
                        canvas.width = w; canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        canvas.toBlob((blob) => {
                            const newFile = new File([blob], file.name.replace(/\\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
                            resolve(newFile);
                        }, 'image/jpeg', quality);
                    };
                };
            });
        }

        async function uploadToCloudinary(file) {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', UPLOAD_PRESET);
            const res = await fetch(\`https://api.cloudinary.com/v1_1/\${CLOUD_NAME}/image/upload\`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            return data.secure_url;
        }

        const crForm = document.getElementById('custom-request-form');
        if (crForm) {
            crForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const file = crImageInput.files[0];
                if (!file) {
                    showToast('الرجاء اختيار صورة للتصميم', 'error');
                    return;
                }

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'جاري المعالجة والرفع...';

                    const imageUrl = await uploadToCloudinary(file);
                    
                    const reqData = {
                        customerName: document.getElementById('cr-name').value,
                        customerContact: document.getElementById('cr-contact').value,
                        imageUrl: imageUrl,
                        description: document.getElementById('cr-description').value
                    };

                    const token = localStorage.getItem('auraToken');
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = 'Bearer ' + token;

                    const res = await fetch(API + '/api/custom-requests', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(reqData)
                    });

                    if (!res.ok) throw new Error('فشل إرسال الطلب');

                    showToast('تم إرسال طلبك بنجاح! سنتواصل معك قريباً بالسعر.', 'success');
                    crForm.reset();
                    if(crImagePreview) crImagePreview.style.display = 'none';

                    if (token) {
                        setTimeout(() => {
                            window.location.href = 'account.html';
                        }, 2000);
                    }

                } catch (err) {
                    console.error(err);
                    showToast('عذرياً، حدث خطأ أثناء إرسال الطلب.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '✦ إرسال الطلب لتحديد السعر';
                }
            });
        }
    </script>`;

content = content.replace(regex, newScript);
fs.writeFileSync(p, content);
console.log('design.html script replaced');
