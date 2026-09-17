import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCG3GWLbgb_XUyd0qaHRGZB7Fu-93B76qw",
    authDomain: "laptopstore-70ac1.firebaseapp.com",
    projectId: "laptopstore-70ac1",
    storageBucket: "laptopstore-70ac1.firebasestorage.app",
    messagingSenderId: "1039775156731",
    appId: "1:1039775156731:web:f7f410ba160eaa4f2e635e",
    measurementId: "G-YVZHSE8Z30"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const addLaptopForm = document.getElementById('add-laptop-form');
const saveBtn = document.getElementById('save-btn');
const statusMsg = document.getElementById('status-msg');

let adminLaptopsList = document.getElementById('admin-laptops-list');
if (!adminLaptopsList && adminDashboard) {
    adminLaptopsList = document.createElement('div');
    adminLaptopsList.id = 'admin-laptops-list';
    adminLaptopsList.className = 'mt-8 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow';
    adminLaptopsList.innerHTML = `<h3 class="text-xl font-bold mb-4 text-gray-800">الأجهزة المضافة حالياً (لإدارتها أو حذفها)</h3><div id="laptops-container" class="space-y-3"></div>`;
    adminDashboard.appendChild(adminLaptopsList);
}

// مراقبة حالة الدخول (هذا المسؤول الوحيد عن إظهار/إخفاء الشاشات بسلاسة)
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginSection) loginSection.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        loadAdminLaptops();
    } else {
        if (loginSection) loginSection.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
    }
});

// تسجيل الدخول بطريقة سليمة وآمنة
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (loginError) loginError.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // بمجرد نجاح العملية، الـ onAuthStateChanged سيتكفل بتحويل الشاشة تلقائياً
    } catch (error) {
        console.error(error);
        if (loginError) loginError.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }
});

logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

async function loadAdminLaptops() {
    const container = document.getElementById('laptops-container');
    if (!container) return;
    container.innerHTML = "جاري تحميل الأجهزة...";

    try {
        const querySnapshot = await getDocs(collection(db, "laptops"));
        container.innerHTML = "";
        
        if (querySnapshot.empty) {
            container.innerHTML = "<p class='text-gray-500'>لا توجد أجهزة مضافة حالياً.</p>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const laptop = docSnap.data();
            const laptopId = docSnap.id;

            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-3 border rounded-lg bg-gray-50";
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    ${laptop.imageUrl ? `<img src="${laptop.imageUrl}" class="w-12 h-12 object-cover rounded">` : ''}
                    <div>
                        <h4 class="font-bold text-gray-800">${laptop.name || 'بدون اسم'}</h4>
                        <span class="text-sm text-blue-600 font-semibold">${laptop.jdPrice} د.أ</span>
                    </div>
                </div>
                <button data-id="${laptopId}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">حذف</button>
            `;
            container.appendChild(item);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
                    try {
                        await deleteDoc(doc(db, "laptops", id));
                        loadAdminLaptops();
                    } catch (err) {
                        alert('حدث خطأ أثناء الحذف');
                    }
                }
            });
        });

    } catch (error) {
        container.innerHTML = "<p class='text-red-500'>فشل في تحميل الأجهزة.</p>";
    }
}

// تحويل ملف الصورة المحلي إلى Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

addLaptopForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري النشر...`;
    statusMsg.textContent = "";

    const name = document.getElementById('laptop-name').value;
    const jdPrice = document.getElementById('laptop-price').value;
    const actualSpecs = document.getElementById('laptop-specs').value;
    const imageInput = document.getElementById('laptop-image-file');
    const imageFile = imageInput && imageInput.files ? imageInput.files[0] : null;

    try {
        let imageUrl = "";
        if (imageFile) {
            imageUrl = await convertFileToBase64(imageFile);
        }

        await addDoc(collection(db, "laptops"), {
            name,
            jdPrice: Number(jdPrice),
            specs: actualSpecs,
            imageUrl,
            createdAt: new Date()
        });

        statusMsg.className = "text-green-600 text-center text-sm mt-2 font-semibold";
        statusMsg.textContent = "تم رفع الصورة وإضافة الجهاز بنجاح!";
        addLaptopForm.reset();
        loadAdminLaptops();
    } catch (error) {
        console.error("Error adding document: ", error);
        statusMsg.className = "text-red-500 text-center text-sm mt-2 font-semibold";
        statusMsg.textContent = "حدث خطأ أثناء الحفظ، تأكد من الاتصال وقواعد البيانات.";
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `حفظ ونشر الجهاز`;
    }
});
```[cite: 1]

حفظ التغييرات على GitHub، وقم بعمل تحديث (Refresh) للصفحة، وستدخل لوحة التحكم فوراً وبشكل طبيعي جداً!