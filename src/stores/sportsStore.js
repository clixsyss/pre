import { defineStore } from "pinia";
import { ref } from "vue";
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
    const loading = ref(false);
    const error = ref(null);

    const fetchSports = async (projectId) => {
        if (!projectId) {
            console.warn("No project ID provided to fetchSports");
            // Clear data when no project is selected
            sportsOptions.value = [];
            courtsBySport.value = {};
            return;
        }

        try {
            loading.value = true;
            error.value = null;

            // First, fetch all courts from the project to see what sports are referenced
            const courtsRef = collection(db, `projects/${projectId}/courts`);
            const courtsSnapshot = await getDocs(courtsRef);
            
            const courtsData = {};
            const sportIds = new Set();
            
            // Process courts and collect unique sport IDs
            courtsSnapshot.forEach((docSnap) => {
                const courtData = docSnap.data();
                const sportId = courtData.sport;
                
                console.log('Processing court:', docSnap.id, 'with sport ID:', sportId);
                
                if (sportId) {
                    sportIds.add(sportId);
                    
                    // Initialize sport in courtsData if not exists
                    if (!courtsData[sportId]) {
                        courtsData[sportId] = [];
                    }
                    
                    // Add court to the sport's courts array
                    courtsData[sportId].push({
                        id: docSnap.id,
                        ...courtData,
                        unavailability: courtData.unavailability || []
                    });
                }
            });

            console.log('Collected sport IDs:', Array.from(sportIds));
            console.log('Courts data structure:', courtsData);

            // Now fetch sports data for the collected sport IDs
            const sportsRef = collection(db, `projects/${projectId}/sports`);
            const sportsSnapshot = await getDocs(sportsRef);
            
            console.log('Sports snapshot size:', sportsSnapshot.size);
            
            const sportsData = [];
            const existingSportIds = new Set();
            
            sportsSnapshot.forEach((docSnap) => {
                const sportData = docSnap.data();
                const sportId = docSnap.id;
                existingSportIds.add(sportId);
                
                console.log('Processing sport:', sportId, 'with data:', sportData);
                
                // Only include sports that have courts
                if (courtsData[sportId] && courtsData[sportId].length > 0) {
                    sportsData.push({
                        id: sportId,
                        name: sportData.name || sportId, // Use name if available, fallback to ID
                        ...sportData
                    });
                    console.log('Added sport to sportsData:', sportId);
                } else {
                    console.log('Skipped sport (no courts):', sportId);
                }
            });

            // Check for missing sports and create them
            for (const sportId of sportIds) {
                if (!existingSportIds.has(sportId)) {
                    console.log('Sport not found, creating from court data:', sportId);
                    // Find a court for this sport to get some data
                    const courtData = courtsData[sportId][0];
                    if (courtData) {
                        await createSportFromCourt(projectId, sportId, courtData);
                        // Add the newly created sport to sportsData
                        sportsData.push({
                            id: sportId,
                            name: sportId, // Use ID as name for now
                            description: `Sport for ${courtData.name || 'court'}`,
                            category: 'General',
                            active: true
                        });
                    }
                }
            }

            // Update the store with sports that have courts
            sportsOptions.value = sportsData.map(sport => sport.name || sport.id);
            courtsBySport.value = courtsData;

            console.log(`Fetched ${sportsData.length} sports with courts for project ${projectId}`);
            console.log('Sports found:', sportsData);
            console.log('Courts by sport:', courtsData);
        } catch (error) {
            console.error("Error fetching sports:", error);
            error.value = error.message;
        } finally {
            loading.value = false;
        }
    };

    const addSport = async (projectId, sport) => {
        if (!projectId || !sport.trim()) return;

        const sportRef = doc(db, `projects/${projectId}/sports`, sport);

        try {
            await setDoc(sportRef, { 
                name: sport,
                courts: [] 
            }, { merge: true });

            if (!sportsOptions.value.includes(sport)) {
                sportsOptions.value.push(sport);
            }
            courtsBySport.value[sport] = [];

            console.log(`Added Sport: ${sport} to project ${projectId}`);
        } catch (error) {
            console.error("Error adding sport:", error);
            throw error;
        }
    };

    const addCourt = async (projectId, sport, court) => {
        if (!projectId || !courtsBySport.value[sport]) {
            courtsBySport.value[sport] = [];
        }

        courtsBySport.value[sport].push(court);

        const sportRef = doc(db, `projects/${projectId}/sports`, sport);
        await updateDoc(sportRef, { courts: courtsBySport.value[sport] });
    };

    const updateCourt = async (projectId, sport, courtId, updatedCourt) => {
        if (!projectId || !courtsBySport.value[sport]) return;

        const index = courtsBySport.value[sport].findIndex(c => c.id === courtId);
        if (index !== -1) {
            courtsBySport.value[sport][index] = updatedCourt;

            const sportRef = doc(db, `projects/${projectId}/sports`, sport);
            await updateDoc(sportRef, { courts: courtsBySport.value[sport] });
        }
    };

    const getSportsWithCourts = () => {
        return sportsOptions.value.filter(sport => 
            courtsBySport.value[sport] && courtsBySport.value[sport].length > 0
        );
    };

    const getCourtsForSport = (sportName) => {
        // Find the sport ID that matches the sport name
        const sportId = Object.keys(courtsBySport.value).find(sportId => {
            // Check if this sport ID has a name that matches the requested sport name
            const sportData = sportsOptions.value.find(sport => sport === sportName);
            return sportData && courtsBySport.value[sportId];
        });
        
        return sportId ? courtsBySport.value[sportId] || [] : [];
    };

    const clearData = () => {
        sportsOptions.value = [];
        courtsBySport.value = {};
        loading.value = false;
        error.value = null;
    };

    const resetForNewProject = () => {
        clearData();
    };

    // Debug method to help troubleshoot
    const debugSportsData = () => {
        console.log('=== SPORTS STORE DEBUG ===');
        console.log('sportsOptions:', sportsOptions.value);
        console.log('courtsBySport:', courtsBySport.value);
        console.log('loading:', loading.value);
        console.log('error:', error.value);
    };

    // Method to create a sport from court data if it doesn't exist
    const createSportFromCourt = async (projectId, sportId, courtData) => {
        try {
            const sportRef = doc(db, `projects/${projectId}/sports`, sportId);
            await setDoc(sportRef, {
                name: sportId, // Use the ID as name for now
                description: `Sport for ${courtData.name || 'court'}`,
                category: 'General',
                active: true,
                createdAt: new Date().toISOString()
            });
            console.log('Created sport from court data:', sportId);
            return true;
        } catch (error) {
            console.error('Error creating sport from court:', error);
            return false;
        }
    };

    return {
        sportsOptions,
        courtsBySport,
        loading,
        error,
        fetchSports,
        addSport,
        addCourt,
        updateCourt,
        getSportsWithCourts,
        getCourtsForSport,
        clearData,
        resetForNewProject,
        debugSportsData,
        createSportFromCourt
    };
});
