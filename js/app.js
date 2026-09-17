import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

// ضع رقم الواتساب هنا (مثال: 9627xxxxxxxx بدون علامة الزائد)
const whatsappNumber = "962788616352"; 

async function loadLaptops() {
    const grid = document.getElementById('laptops-grid');
    const loading = document.getElementById('loading');
    
    try {
        const querySnapshot = await getDocs(collection(db, "laptops"));
        loading.style.display = 'none';
        
        if (querySnapshot.empty) {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8">لا توجد أجهزة متوفرة حالياً.</p>`;
            return;
        }

        grid.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const laptop = doc.data();
            const message = encodeURIComponent(`مرحباً، أنا مهتم بشراء لابتوب (${laptop.name}) المعروض بسعر ${laptop.jdPrice} دينار. هل ما زال متوفراً؟`);
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

            grid.innerHTML += `
                <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                    <img src="${laptop.imageUrl}" alt="${laptop.name}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-bold text-lg text-gray-800">${laptop.name}</h3>
                            <span class="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">${laptop.jdPrice} د.أ</span>
                        </div>
                        <p class="text-gray-600 text-sm mb-4 leading-relaxed">${laptop.specs}</p>
                        
                        <div class="flex gap-2 pt-3 border-t border-gray-100">
                            <a href="${whatsappLink}" target="_blank" class="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                                <i class="fa-brands fa-whatsapp text-lg"></i> واتساب
                            </a>
                            <a href="https://www.facebook.com/tawfik.salem.102260" target="_blank" class="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <i class="fa-brands fa-facebook-messenger text-lg"></i> ماسنجر
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading laptops: ", error);
        loading.innerHTML = `<p class="text-red-500">حدث خطأ أثناء تحميل البيانات.</p>`;
    }
}

loadLaptops();
