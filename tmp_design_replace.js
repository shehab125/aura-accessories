const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'design.html');
let content = fs.readFileSync(p, 'utf8');

const lines = content.split('\n');

const newHTML = `            <div id="custom-request-panel" style="max-width:800px; margin:0 auto;">
                <div class="glass-card reveal" style="padding: var(--space-8);">
                    <div style="text-align:center; margin-bottom: var(--space-8);">
                        <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(183,110,121,0.1)); display:flex; align-items:center; justify-content:center; margin: 0 auto var(--space-4); font-size:2.5rem;">
                            📸
                        </div>
                        <h3 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);" data-i18n="customRequest">طلب تصميم خاص</h3>
                        <p style="color: var(--text-secondary);" data-i18n="customRequestDesc">عجبك تصميم معين؟ ارفع صورته واكتب تفاصيله وسنقوم بتنفيذه لك خصيصاً.</p>
                    </div>

                    <form id="custom-request-form">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div>
                                <label style="display:block; font-size: var(--text-sm); margin-bottom: var(--space-2); color: var(--text-secondary);" data-i18n="fullName">الاسم بالكامل</label>
                                <input type="text" id="cr-name" class="form-input" required placeholder="الاسم" style="width: 100%;">
                            </div>
                            <div>
                                <label style="display:block; font-size: var(--text-sm); margin-bottom: var(--space-2); color: var(--text-secondary);" data-i18n="phoneNumber">رقم الهاتف للتواصل</label>
                                <input type="tel" id="cr-contact" class="form-input" required placeholder="01xxxxxxxxx" style="width: 100%;">
                            </div>
                        </div>

                        <div style="margin-bottom: var(--space-4);">
                            <label style="display:block; font-size: var(--text-sm); margin-bottom: var(--space-2); color: var(--text-secondary);" data-i18n="designImage">صورة التصميم</label>
                            <input type="file" id="cr-image" accept="image/*" class="form-input" required style="padding: var(--space-2); width: 100%; cursor: pointer;">
                            <div id="cr-image-preview" style="margin-top: var(--space-4); display:none; text-align:center;">
                                <img src="" style="max-width:200px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            </div>
                        </div>

                        <div style="margin-bottom: var(--space-6);">
                            <label style="display:block; font-size: var(--text-sm); margin-bottom: var(--space-2); color: var(--text-secondary);" data-i18n="designDetails">تفاصيل القطعة (نوع المعدن، الأحجار، المقاس...)</label>
                            <textarea id="cr-description" class="form-input" rows="4" required placeholder="اكتب تفاصيل المجوهرات المطلوبة هنا..." style="width: 100%;"></textarea>
                        </div>

                        <button type="submit" id="cr-submit-btn" class="btn btn-primary btn-lg" style="width:100%;" data-i18n="submitRequest">✦ إرسال الطلب لتحديد السعر</button>
                    </form>
                </div>
            </div>`;

// Replace lines 319 to 613 (0-indexed 319 to 612)
// but let's just make sure we are not removing wrong lines, since we don't know if lines match exactly.
// It's safer to use `.replace(string, newHTML)`.
const htmlStartStr = '            <!-- Step Tabs -->';
const htmlEndStr = '    <footer class="footer">';

const htmlStartIdx = content.indexOf(htmlStartStr);
const htmlEndIdx = content.indexOf(htmlEndStr);

if (htmlStartIdx > -1 && htmlEndIdx > -1) {
    content = content.substring(0, htmlStartIdx) + newHTML + '\n        </div>\n    </section>\n\n' + content.substring(htmlEndIdx);
} else {
    console.log('Could not find HTML boundaries');
}

const scriptStartStr = '<script>\n        function switchTab(tab)';
const scriptEndStr = '        }\n    </script>';

const scriptStartIdx = content.indexOf(scriptStartStr);
const scriptEndIdx = content.indexOf(scriptEndStr) + scriptEndStr.length;

if (scriptStartIdx > -1 && scriptEndIdx > -1) {
    const newScript = `<script>
        // Cloudinary Details for client upload
        // Note: It is better to use signed uploads in production, but unsigned works here for Demo
        const CLOUD_NAME = 'dldw5b65h';
        const UPLOAD_PRESET = 'aura_unsigned';

        const crImageInput = document.getElementById('cr-image');
        const crImagePreview = document.getElementById('cr-image-preview');
        const crPreviewImg = crImagePreview.querySelector('img');
        const submitBtn = document.getElementById('cr-submit-btn');

        crImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                crPreviewImg.src = URL.createObjectURL(file);
                crImagePreview.style.display = 'block';
            } else {
                crImagePreview.style.display = 'none';
            }
        });

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

        document.getElementById('custom-request-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = crImageInput.files[0];
            if (!file) {
                showToast('الرجاء اختيار صورة للتصميم', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
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
                document.getElementById('custom-request-form').reset();
                crImagePreview.style.display = 'none';

                // Optional: redirect to account page if they are logged in so they see it
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
    </script>`;
    content = content.substring(0, scriptStartIdx) + newScript + content.substring(scriptEndIdx);
} else {
    console.log('Could not find JS boundaries');
}

fs.writeFileSync(p, content);
console.log('design.html updated');
