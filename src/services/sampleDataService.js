import { db } from "boot/firebase";
import {
    collection,
    doc,
    setDoc,
    getDocs
} from "firebase/firestore";

export class SampleDataService {
    constructor() {
        this.db = db;
    }

    // Initialize sample bookings data
    async initializeSampleBookings(projectId) {
        if (!projectId) {
            console.warn('No project ID provided for sample bookings initialization');
            return false;
        }

        try {
            const sampleBookings = [
                {
                    id: 'booking-1',
                    userId: 'current-user-id',
                    type: 'court',
                    sport: 'Tennis',
                    courtId: 'tennis-court-1',
                    courtName: 'Tennis Court 1',
                    date: new Date().toISOString().split('T')[0],
                    timeSlots: ['2:00 PM', '3:00 PM'],
                    totalPrice: 200,
                    status: 'confirmed',
                    projectId: projectId,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'booking-2',
                    userId: 'current-user-id',
                    type: 'court',
                    sport: 'Basketball',
                    courtId: 'basketball-court-1',
                    courtName: 'Basketball Court 1',
                    date: new Date().toISOString().split('T')[0],
                    timeSlots: ['6:00 PM', '7:00 PM'],
                    totalPrice: 240,
                    status: 'confirmed',
                    projectId: projectId,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'booking-3',
                    userId: 'current-user-id',
                    type: 'academy',
                    academyId: 'Elite Tennis Academy',
                    academyName: 'Elite Tennis Academy',
                    programId: 'tennis-beginners',
                    programName: 'Tennis for Beginners',
                    participant: {
                        fullName: 'Ahmed Hassan',
                        email: 'ahmed@example.com',
                        phone: '+20 123 456 789',
                        age: '10'
                    },
                    price: 2500,
                    enrollmentDate: new Date().toISOString(),
                    status: 'enrolled',
                    projectId: projectId,
                    createdAt: new Date().toISOString()
                }
            ];

            for (const booking of sampleBookings) {
                const bookingRef = doc(this.db, `projects/${projectId}/bookings`, booking.id);
                await setDoc(bookingRef, booking);
            }

            console.log('Sample bookings data initialized successfully for project:', projectId);
            return true;
        } catch (error) {
            console.error('Error initializing sample bookings:', error);
            return false;
        }
    }

    // Initialize sample sports data for a specific project
    async initializeSampleSports(projectId) {
        if (!projectId) {
            console.warn('No project ID provided for sample sports initialization');
            return false;
        }

        try {
            const sampleSports = [
                {
                    name: 'Tennis',
                    description: 'Indoor and outdoor tennis courts',
                    category: 'Racket Sports',
                    difficulty: 'All Levels',
                    active: true
                },
                {
                    name: 'Basketball',
                    description: 'Indoor basketball courts',
                    category: 'Team Sports',
                    difficulty: 'All Levels',
                    active: true
                },
                {
                    name: 'Swimming',
                    description: 'Olympic-size swimming pool',
                    category: 'Aquatic Sports',
                    difficulty: 'All Levels',
                    active: true
                }
            ];

            for (const sport of sampleSports) {
                const sportRef = doc(this.db, `projects/${projectId}/sports`, sport.name);
                await setDoc(sportRef, sport);
            }

            console.log('Sample sports data initialized successfully for project:', projectId);
            return true;
        } catch (error) {
            console.error('Error initializing sample sports:', error);
            return false;
        }
    }

    // Initialize sample academies data for a specific project
    async initializeSampleAcademies(projectId) {
        if (!projectId) {
            console.warn('No project ID provided for sample academies initialization');
            return false;
        }

        try {
            const sampleAcademies = [
                {
                    name: 'Elite Tennis Academy',
                    description: 'Professional tennis training for all ages',
                    email: 'info@elitetennis.com',
                    phone: '+20 123 456 789',
                    website: 'www.elitetennis.com',
                    programs: [
                        {
                            id: 'tennis-beginners',
                            name: 'Tennis for Beginners',
                            description: 'Learn the basics of tennis',
                            price: 2500,
                            duration: '3 months',
                            ageGroup: '8-12 years'
                        }
                    ]
                }
            ];

            for (const academy of sampleAcademies) {
                const academyRef = doc(this.db, `projects/${projectId}/academies`, academy.name);
                await setDoc(academyRef, academy);
            }

            console.log('Sample academies data initialized successfully for project:', projectId);
            return true;
        } catch (error) {
            console.error('Error initializing sample academies:', error);
            return false;
        }
    }

    // Check if sample data already exists for a specific project
    async checkSampleDataExists(projectId) {
        if (!projectId) {
            console.warn('No project ID provided for checking sample data');
            return { sports: false, academies: false, bookings: false };
        }

        try {
            const sportsSnapshot = await getDocs(collection(this.db, `projects/${projectId}/sports`));
            const academiesSnapshot = await getDocs(collection(this.db, `projects/${projectId}/academies`));
            const bookingsSnapshot = await getDocs(collection(this.db, `projects/${projectId}/bookings`));

            return {
                sports: !sportsSnapshot.empty,
                academies: !academiesSnapshot.empty,
                bookings: !bookingsSnapshot.empty
            };
        } catch (error) {
            console.error('Error checking sample data:', error);
            return { sports: false, academies: false, bookings: false };
        }
    }

    // Initialize all sample data for a specific project
    async initializeAllSampleData(projectId) {
        if (!projectId) {
            console.warn('No project ID provided for sample data initialization');
            return false;
        }

        try {
            const existingData = await this.checkSampleDataExists(projectId);
            
            if (!existingData.sports) {
                await this.initializeSampleSports(projectId);
            }
            
            if (!existingData.academies) {
                await this.initializeSampleAcademies(projectId);
            }
            
            if (!existingData.bookings) {
                await this.initializeSampleBookings(projectId);
            }

            console.log('All sample data initialized successfully for project:', projectId);
            return true;
        } catch (error) {
            console.error('Error initializing all sample data:', error);
            return false;
        }
    }

    // Clear all sample data (for testing)
    async clearAllSampleData() {
        try {
            // Note: This is a destructive operation and should only be used in development
            console.warn('Clearing all sample data...');
            
            // Implementation would depend on your specific needs
            // You might want to add confirmation dialogs or admin checks
            
            return true;
        } catch (error) {
            console.error('Error clearing sample data:', error);
            return false;
        }
    }
}

export default new SampleDataService();
