<template>
  <div class="firebase-example">
    <h3>Firebase Integration Example</h3>
    
    <!-- Authentication Section -->
    <div class="auth-section">
      <h4>Authentication</h4>
      <div v-if="!user">
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <button @click="signIn">Sign In</button>
        <button @click="signUp">Sign Up</button>
      </div>
      <div v-else>
        <p>Welcome, {{ user.email }}!</p>
        <button @click="signOut">Sign Out</button>
      </div>
    </div>

    <!-- Firestore Section -->
    <div class="firestore-section">
      <h4>Firestore Database</h4>
      <input v-model="message" placeholder="Enter a message" />
      <button @click="saveMessage">Save Message</button>
      
      <div class="messages">
        <h5>Messages:</h5>
        <div v-for="msg in messages" :key="msg.id" class="message">
          {{ msg.text }} - {{ msg.timestamp }}
        </div>
      </div>
    </div>

    <!-- Storage Section -->
    <div class="storage-section">
      <h4>Storage</h4>
      <input type="file" @change="handleFileUpload" />
      <button @click="uploadFile" :disabled="!selectedFile">Upload File</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  getDocs, 
  orderBy, 
  query, 
  serverTimestamp 
} from 'firebase/firestore'
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { auth, db, storage } from '../boot/firebase'

// Reactive data
const user = ref(null)
const email = ref('')
const password = ref('')
const message = ref('')
const messages = ref([])
const selectedFile = ref(null)

// Authentication methods
const signIn = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (error) {
    console.error('Sign in error:', error)
    alert('Sign in failed: ' + error.message)
  }
}

const signUp = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (error) {
    console.error('Sign up error:', error)
    alert('Sign up failed: ' + error.message)
  }
}

const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// Firestore methods
const saveMessage = async () => {
  if (!message.value.trim() || !user.value) return
  
  try {
    await addDoc(collection(db, 'messages'), {
      text: message.value,
      userId: user.value.uid,
      timestamp: serverTimestamp()
    })
    message.value = ''
    loadMessages()
  } catch (error) {
    console.error('Save message error:', error)
    alert('Failed to save message: ' + error.message)
  }
}

const loadMessages = async () => {
  try {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    messages.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Load messages error:', error)
  }
}

// Storage methods
const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadFile = async () => {
  if (!selectedFile.value || !user.value) return
  
  try {
    const fileRef = storageRef(storage, `uploads/${user.value.uid}/${selectedFile.value.name}`)
    await uploadBytes(fileRef, selectedFile.value)
    const downloadURL = await getDownloadURL(fileRef)
    alert(`File uploaded successfully! Download URL: ${downloadURL}`)
    selectedFile.value = null
  } catch (error) {
    console.error('Upload error:', error)
    alert('Upload failed: ' + error.message)
  }
}

// Lifecycle
onMounted(() => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      loadMessages()
    }
  })
})
</script>

<style scoped>
.firebase-example {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.auth-section,
.firestore-section,
.storage-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h3, h4, h5 {
  margin-top: 0;
  color: #333;
}

input {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1565c0;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.messages {
  margin-top: 20px;
}

.message {
  padding: 10px;
  margin: 5px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
