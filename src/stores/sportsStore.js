import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import {
    collection,
    getDocs,
    updateDoc,
    doc, 
    setDoc,
} from "firebase/firestore";

export const useSportsStore = defineStore("sportsStore", () => {
    const sportsOptions = ref([]);
    const courtsBySport = ref({});

    const fetchSports = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "sports"));
            const sportsData = [];
            const courtsData = {};

            querySnapshot.forEach((docSnap) => {
                const sport = docSnap.id;
                const data = docSnap.data();
                sportsData.push(sport);
                
                // Ensure each court has an unavailability array
                courtsData[sport] = (data.courts || []).map(court => ({
                    ...court,
                    unavailability: court.unavailability || []
                }));
            });

            sportsOptions.value = sportsData;
            courtsBySport.value = courtsData;
        } catch (error) {
            console.error("Error fetching sports:", error);
        }
    };

    const addSport = async (sport) => {
        if (!sport.trim()) return;

        const sportRef = doc(db, "sports", sport);

        try {
            await setDoc(sportRef, { courts: [] }, { merge: true });

            sportsOptions.value.push(sport);
            courtsBySport.value[sport] = [];

            console.log(`Added Sport: ${sport} to Firestore`);
        } catch (error) {
            console.error("Error adding sport:", error);
        }
    };

    const addCourt = async (sport, court) => {
        if (!courtsBySport.value[sport]) {
            courtsBySport.value[sport] = [];
        }

        courtsBySport.value[sport].push(court);

        const sportRef = doc(db, "sports", sport);
        await updateDoc(sportRef, { courts: courtsBySport.value[sport] });
    };

    const updateCourt = async (sport, courtId, updatedCourt) => {
        if (!courtsBySport.value[sport]) return;

        const index = courtsBySport.value[sport].findIndex(c => c.id === courtId);
        if (index !== -1) {
            courtsBySport.value[sport][index] = updatedCourt;

            const sportRef = doc(db, "sports", sport);
            await updateDoc(sportRef, { courts: courtsBySport.value[sport] });
        }
    };

    onMounted(fetchSports);

    return {
        sportsOptions,
        courtsBySport,
        fetchSports,
        addSport,
        addCourt,
        updateCourt,
    };
});
