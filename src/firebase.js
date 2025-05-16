  {/* // Import the functions you need from the SDKs you need */}
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
  {/* // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries */}

  {/* // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional */}
  const firebaseConfig = {
    apiKey: "AIzaSyBZq68Ne2hrSdIXOJOYmvPpOzn2NvYWa_U",
    authDomain: "memory-mercury.firebaseapp.com",
    projectId: "memory-mercury",
    storageBucket: "memory-mercury.firebasestorage.app",
    messagingSenderId: "714318494275",
    appId: "1:714318494275:web:cd5e95a4105454722032f6",
    measurementId: "G-810GNSFPJN"
  };

  {/* // Initialize Firebase */}
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
