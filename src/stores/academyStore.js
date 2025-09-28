import { defineStore } from "pinia";
import { ref } from "vue";
import firestoreService from "../services/firestoreService";
import performanceService from "../services/performanceService";
import errorHandlingService from "../services/errorHandlingService";

export const useAcademiesStore = defineStore("academiesStore", () => {
    const academyOptions = ref([]);
    const programsByAcademy = ref({});
    const selectedAcademy = ref(null);
    const userBookings = ref([]);

    const addAcademy = async (academy) => {
        return performanceService.timeOperation('addAcademy', async () => {
            try {
                console.log('🚀 AcademyStore: Adding academy:', academy.name);
                await firestoreService.setDoc(`academies/${academy.name}`, {
                    email: academy.email,
                    phone: academy.phone,
                    website: academy.website,
                    programs: []
                });

                academyOptions.value.push({
                    id: academy.name,
                    email: academy.email,
                    phone: academy.phone,
                    website: academy.website,
                    programs: [],
                    imageUrl: academy.imageUrl || null,
                    imageFileName: academy.imageFileName || null
                });
                programsByAcademy.value[academy.name] = [];
                console.log('✅ AcademyStore: Academy added successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error adding academy:", error);
                errorHandlingService.handleFirestoreError(error, 'addAcademy');
                throw error;
            }
        });
    };

    const updateAcademy = async (academy) => {
        return performanceService.timeOperation('updateAcademy', async () => {
            try {
                console.log('🚀 AcademyStore: Updating academy:', academy.name);
                await firestoreService.updateDoc(`academies/${academy.name}`, {
                    email: academy.email,
                    phone: academy.phone,
                    website: academy.website
                });

                const index = academyOptions.value.findIndex(a => a.id === academy.name);
                if (index !== -1) {
                    academyOptions.value[index] = { ...academyOptions.value[index], ...academy };
                }
                console.log('✅ AcademyStore: Academy updated successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error updating academy:", error);
                errorHandlingService.handleFirestoreError(error, 'updateAcademy');
                throw error;
            }
        });
    };

    const deleteAcademy = async (academyId) => {
        return performanceService.timeOperation('deleteAcademy', async () => {
            try {
                console.log('🚀 AcademyStore: Deleting academy:', academyId);
                await firestoreService.deleteDoc(`academies/${academyId}`);
                academyOptions.value = academyOptions.value.filter(a => a.id !== academyId);
                delete programsByAcademy.value[academyId];
                console.log('✅ AcademyStore: Academy deleted successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error deleting academy:", error);
                errorHandlingService.handleFirestoreError(error, 'deleteAcademy');
                throw error;
            }
        });
    };

    const addProgram = async (academyId, program) => {
        return performanceService.timeOperation('addProgram', async () => {
            try {
                console.log('🚀 AcademyStore: Adding program to academy:', academyId);
                const academyPrograms = programsByAcademy.value[academyId] || [];
                academyPrograms.push(program);
                programsByAcademy.value[academyId] = academyPrograms;
                await firestoreService.updateDoc(`academies/${academyId}`, { programs: academyPrograms });
                console.log('✅ AcademyStore: Program added successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error adding program:", error);
                errorHandlingService.handleFirestoreError(error, 'addProgram');
                throw error;
            }
        });
    };

    const updateProgram = async (academyId, programId, updatedProgram) => {
        return performanceService.timeOperation('updateProgram', async () => {
            try {
                console.log('🚀 AcademyStore: Updating program:', programId);
                const academyPrograms = programsByAcademy.value[academyId] || [];
                const index = academyPrograms.findIndex(p => p.id === programId);
                if (index !== -1) {
                    academyPrograms[index] = updatedProgram;
                    programsByAcademy.value[academyId] = academyPrograms;
                    await firestoreService.updateDoc(`academies/${academyId}`, { programs: academyPrograms });
                    console.log('✅ AcademyStore: Program updated successfully');
                }
            } catch (error) {
                console.error("❌ AcademyStore: Error updating program:", error);
                errorHandlingService.handleFirestoreError(error, 'updateProgram');
                throw error;
            }
        });
    };

    const deleteProgram = async (academyId, programId) => {
        return performanceService.timeOperation('deleteProgram', async () => {
            try {
                console.log('🚀 AcademyStore: Deleting program:', programId);
                const academyPrograms = programsByAcademy.value[academyId] || [];
                const filteredPrograms = academyPrograms.filter(p => p.id !== programId);
                programsByAcademy.value[academyId] = filteredPrograms;
                await firestoreService.updateDoc(`academies/${academyId}`, { programs: filteredPrograms });
                console.log('✅ AcademyStore: Program deleted successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error deleting program:", error);
                errorHandlingService.handleFirestoreError(error, 'deleteProgram');
                throw error;
            }
        });
    };

    const setSelectedAcademy = (academy) => {
        selectedAcademy.value = academy;
    };

    const addUserBooking = async (booking) => {
        return performanceService.timeOperation('addUserBooking', async () => {
            try {
                console.log('🚀 AcademyStore: Adding user booking');
                const newBooking = {
                    ...booking,
                    createdAt: new Date(),
                    status: "confirmed"
                };

                const docId = await firestoreService.addDoc('userBookings', newBooking);
                newBooking.id = docId;
                userBookings.value.push(newBooking);
                console.log('✅ AcademyStore: User booking added successfully');
            } catch (error) {
                console.error("❌ AcademyStore: Error adding user booking:", error);
                errorHandlingService.handleFirestoreError(error, 'addUserBooking');
                throw error;
            }
        });
    };

    // Method to create a test booking in project-specific collection
    const createTestBooking = async (projectId, userId, bookingData) => {
        return performanceService.timeOperation('createTestBooking', async () => {
            try {
                if (!projectId || !userId) {
                    console.warn("Missing projectId or userId for test booking");
                    return false;
                }

                console.log('🚀 AcademyStore: Creating test booking for project:', projectId);
                const newBooking = {
                    ...bookingData,
                    userId: userId,
                    createdAt: new Date(),
                    status: "confirmed"
                };

                const docId = await firestoreService.addDoc(`projects/${projectId}/bookings`, newBooking);
                newBooking.id = docId;
                console.log("✅ AcademyStore: Test booking created successfully:", newBooking);
                return true;
            } catch (error) {
                console.error("❌ AcademyStore: Error creating test booking:", error);
                errorHandlingService.handleFirestoreError(error, 'createTestBooking');
                throw error;
            }
        });
    };

    const fetchUserBookings = async (userId, projectId) => {
        return performanceService.timeOperation('fetchUserBookings', async () => {
            try {
                if (!projectId) {
                    console.warn("No project ID provided to fetchUserBookings");
                    return;
                }

                console.log('🚀 AcademyStore: Fetching user bookings for user:', userId, 'project:', projectId);
                const queryOptions = {
                    filters: [
                        { field: 'userId', operator: '==', value: userId }
                    ],
                    orderBy: [
                        { field: 'createdAt', direction: 'desc' }
                    ],
                    timeoutMs: 6000
                };
                
                const result = await firestoreService.getDocs(`projects/${projectId}/bookings`, queryOptions);
                
                const bookings = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                userBookings.value = bookings;
                console.log("✅ AcademyStore: User bookings fetched:", bookings.length);
            } catch (error) {
                console.error("❌ AcademyStore: Error fetching user bookings:", error);
                errorHandlingService.handleFirestoreError(error, 'fetchUserBookings');
                throw error;
            }
        });
    };

    const clearUserBookings = () => {
        userBookings.value = [];
    };

    const fetchAcademies = async (projectId) => {
        return performanceService.timeOperation('fetchAcademies', async () => {
            try {
                console.log('🚀 AcademyStore: Fetching academies for project:', projectId);
                const queryOptions = {
                    timeoutMs: 6000
                };
                
                const result = await firestoreService.getDocs(`projects/${projectId}/academies`, queryOptions);
                
                const academies = result.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        imageUrl: data.imageUrl || null,
                        imageFileName: data.imageFileName || null
                    };
                });
                
                academyOptions.value = academies;
                
                // Also populate programsByAcademy
                academies.forEach(academy => {
                    if (academy.programs) {
                        programsByAcademy.value[academy.id] = academy.programs;
                    }
                });
                
                console.log("✅ AcademyStore: Academies fetched:", academies.length);
                return academies;
            } catch (error) {
                console.error("❌ AcademyStore: Error fetching academies:", error);
                errorHandlingService.handleFirestoreError(error, 'fetchAcademies');
                throw error;
            }
        });
    };

    return {
        academyOptions,
        programsByAcademy,
        selectedAcademy,
        userBookings,
        addAcademy,
        updateAcademy,
        deleteAcademy,
        addProgram,
        updateProgram,
        deleteProgram,
        setSelectedAcademy,
        addUserBooking,
        fetchUserBookings,
        clearUserBookings,
        createTestBooking,
        fetchAcademies,
    };
});
