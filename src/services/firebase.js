import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAl7Ky0xxgYvbDpFkO6R_bPCYk_G-Yzd_E",
  authDomain: "restaurant-f9159.firebaseapp.com",
  projectId: "restaurant-f9159",
  storageBucket: "restaurant-f9159.firebasestorage.app",
  messagingSenderId: "1048040073986",
  appId: "1:1048040073986:web:3b586494e885e1eeaef01b",
  measurementId: "G-8G20ECBL21"
}

const isConfigured =
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.authDomain.length > 0 &&
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.appId.length > 0

export const firebaseReady = isConfigured

let auth = null
let googleProvider = null

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
}

export { auth, googleProvider }
