import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// كود الفايربيز الخاص بك
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

// عنصر لعرض قائمة الأجهزة المحذوفة/المضافة في لوحة التحكم (إن لم يكن موجوداً سنقوم بإنشائه برمجياً)
let adminLaptopsList = document.getElementById('admin-laptops-list');
if (!adminLaptopsList && adminDashboard) {
    adminLaptopsList = document.createElement('div');
    adminLaptopsList.id = 'admin-laptops-list';
    adminLaptopsList.className = 'mt-8 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow';
    adminLaptopsList.innerHTML = `<h3 class="text-xl font-bold mb-4 text-gray-800">الأجهزة المضافة حالياً (لإدارتها أو حذفها)</h3><div id="laptops-container" class="space-y-3"></div>`;
    adminDashboard.appendChild(adminLaptopsList);
}

// مراقبة حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminLaptops();
    } else {
        loginSection.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
});

// عملية تسجيل الدخول
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }
});

// تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

// جلب وعرض الأجهزة في لوحة التحكم
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
                <div>
                    <h4 class="font-bold text-gray-800">${laptop.name || 'بدون اسم'}</h4>
                    <span class="text-sm text-blue-600 font-semibold">${laptop.jdPrice} د.أ</span>
                </div>
                <button data-id="${laptopId}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">حذف</button>
            `;
            container.appendChild(item);
        });

        // ربط أزرار الحذف
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
                    try {
                        await deleteDoc(doc(db, "laptops", id));
                        loadAdminLaptops(); // إعادة تحميل القائمة
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

// إضافة ونشر جهاز جديد
addLaptopForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري النشر...`;
    statusMsg.textContent = "";

    const name = document.getElementById('laptop-name').value;
    const jdPrice = document.getElementById('laptop-price').value;
    const actualSpecs = document.getElementById('laptop-specs').value;
    const imageUrl = document.getElementById('laptop-image').value;

    try {
        await addDoc(collection(db, "laptops"), {
            name,
            jdPrice: Number(jdPrice),
            specs: actualSpecs,
            imageUrl,
            createdAt: new Date()
        });

        statusMsg.className = "text-green-600 text-center text-sm mt-2 font-semibold";
        statusMsg.textContent = "تم إضافة الجهاز ونشره بنجاح في قاعدة البيانات!";
        addLaptopForm.reset();
        loadAdminLaptops(); // تحديث القائمة مباشرة
    } catch (error) {
        console.error("Error adding document: ", error);
        statusMsg.className = "text-red-500 text-center text-sm mt-2 font-semibold";
        statusMsg.textContent = "حدث خطأ أثناء الحفظ، تأكد من الاتصال وقواعد البيانات.";
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `حفظ ونشر الجهاز`;
    }
});