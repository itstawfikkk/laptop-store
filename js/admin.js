import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// مراقبة حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
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

// إضافة ونشر جهاز جديد
addLaptopForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري النشر...`;
    statusMsg.textContent = "";

    const name = document.getElementById('laptop-name').value;
    const jdPrice = document.getElementById('laptop-price').value;
    const specs = document.getElementById('laptop-specs-value') ? document.getElementById('laptop-specs-value').value : document.getElementById('laptop-specs').value;
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
    } catch (error) {
        console.error("Error adding document: ", error);
        statusMsg.className = "text-red-500 text-center text-sm mt-2 font-semibold";
        statusMsg.textContent = "حدث خطأ أثناء الحفظ، تأكد من الاتصال وقواعد البيانات.";
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `حفظ ونشر الجهاز`;
    }
});