import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvbAR9FT_RytR9A1ayuENEH3WGjHiK3JQ",
  authDomain: "safe-edu-ef1de.firebaseapp.com",
  projectId: "safe-edu-ef1de",
  storageBucket: "safe-edu-ef1de.firebasestorage.app",
  messagingSenderId: "51526921078",
  appId: "1:51526921078:web:86e739acc58610d2baa857",
  measurementId: "G-9RBEZ7ZPJC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);