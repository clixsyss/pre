import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import {
    collection, getDocs, updateDoc, doc,
    setDoc, deleteDoc, serverTimestamp,
    query, where, orderBy
} from "firebase/firestore";

export const useAcademiesStore = defineStore("academiesStore", () => {
    const academyOptions = ref([]);
    const programsByAcademy = ref({});
    const selectedAcademy = ref(null);
    const userBookings = ref([]);

    const fetchAcademies = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "academies"));
            const academyData = [];
            const programData = {};

            querySnapshot.forEach((docSnap) => {
                const academyId = docSnap.id;
                const data = docSnap.data();
                academyData.push({ id: academyId, ...data });
                programData[academyId] = data.programs || [];
            });

            academyOptions.value = academyData;
            programsByAcademy.value = programData;
        } catch (error) {
            console.error("Error fetching academies:", error);
            throw error;
        }
    };

    const addAcademy = async (academy) => {
        try {
            const academyRef = doc(db, "academies", academy.name);
            await setDoc(academyRef, {
                email: academy.email,
                phone: academy.phone,
                website: academy.website,
                programs: []
            }, { merge: true });

            academyOptions.value.push({
                id: academy.name,
                email: academy.email,
                phone: academy.phone,
                website: academy.website,
                programs: []
            });
            programsByAcademy.value[academy.name] = [];
        } catch (error) {
            console.error("Error adding academy:", error);
            throw error;
        }
    };

    const updateAcademy = async (academy) => {
        try {
            const academyRef = doc(db, "academies", academy.name);
            await updateDoc(academyRef, {
                email: academy.email,
                phone: academy.phone,
                website: academy.website
            });

            const index = academyOptions.value.findIndex(a => a.id === academy.name);
            if (index !== -1) {
                academyOptions.value[index] = { ...academyOptions.value[index], ...academy };
            }
        } catch (error) {
            console.error("Error updating academy:", error);
            throw error;
        }
    };

    const deleteAcademy = async (academyId) => {
        try {
            await deleteDoc(doc(db, "academies", academyId));
            academyOptions.value = academyOptions.value.filter(a => a.id !== academyId);
            delete programsByAcademy.value[academyId];
        } catch (error) {
            console.error("Error deleting academy:", error);
            throw error;
        }
    };

    const addProgram = async (academyId, program) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            academyPrograms.push(program);
            programsByAcademy.value[academyId] = academyPrograms;
            await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
        } catch (error) {
            console.error("Error adding program:", error);
            throw error;
        }
    };

    const updateProgram = async (academyId, programId, updatedProgram) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            const index = academyPrograms.findIndex(p => p.id === programId);
            if (index !== -1) {
                academyPrograms[index] = updatedProgram;
                programsByAcademy.value[academyId] = academyPrograms;
                await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
            }
        } catch (error) {
            console.error("Error updating program:", error);
            throw error;
        }
    };

    const deleteProgram = async (academyId, programId) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            const filteredPrograms = academyPrograms.filter(p => p.id !== programId);
            programsByAcademy.value[academyId] = filteredPrograms;
            await updateDoc(doc(db, "academies", academyId), { programs: filteredPrograms });
        } catch (error) {
            console.error("Error deleting program:", error);
            throw error;
        }
    };

    const setSelectedAcademy = (academy) => {
        selectedAcademy.value = academy;
    };

    const addUserBooking = async (booking) => {
        try {
            const bookingRef = doc(collection(db, "userBookings"));
            const newBooking = {
                ...booking,
                id: bookingRef.id,
                createdAt: serverTimestamp(),
                status: "confirmed"
            };

            await setDoc(bookingRef, newBooking);
            userBookings.value.push(newBooking);
        } catch (error) {
            console.error("Error adding user booking:", error);
            throw error;
        }
    };

    const fetchUserBookings = async (userId) => {
        try {
            const q = query(
                collection(db, "userBookings"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            userBookings.value = bookings;
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    };

    onMounted(fetchAcademies);

    return {
        academyOptions,
        programsByAcademy,
        selectedAcademy,
        userBookings,
        fetchAcademies,
        addAcademy,
        updateAcademy,
        deleteAcademy,
        addProgram,
        updateProgram,
        deleteProgram,
        setSelectedAcademy,
        addUserBooking,
        fetchUserBookings,
    };
});
