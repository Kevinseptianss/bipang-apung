'use client'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6BPjKb9Rf-2UjZx9FOMFL4Q4DDF_tBKM",
  authDomain: "bipangapung-43e61.firebaseapp.com",
  projectId: "bipangapung-43e61",
  storageBucket: "bipangapung-43e61.firebasestorage.app",
  messagingSenderId: "423059081740",
  appId: "1:423059081740:web:35c40c89179e399ffbfc29",
  measurementId: "G-RR43Z9ZL9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);