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

    // Initialize sample sports and courts
    async initializeSampleSports() {
        try {
            const sportsData = {
                'Tennis': {
                    courts: [
                        {
                            id: 'tennis-1',
                            name: 'Tennis Court 1',
                            price: 150,
                            isActive: true,
                            unavailability: []
                        },
                        {
                            id: 'tennis-2',
                            name: 'Tennis Court 2',
                            price: 150,
                            isActive: true,
                            unavailability: []
                        }
                    ]
                },
                'Basketball': {
                    courts: [
                        {
                            id: 'basketball-1',
                            name: 'Basketball Court 1',
                            price: 120,
                            isActive: true,
                            unavailability: []
                        }
                    ]
                },
                'Football': {
                    courts: [
                        {
                            id: 'football-1',
                            name: 'Football Field 1',
                            price: 200,
                            isActive: true,
                            unavailability: []
                        }
                    ]
                },
                'Swimming': {
                    courts: [
                        {
                            id: 'swimming-1',
                            name: 'Swimming Pool',
                            price: 100,
                            isActive: true,
                            unavailability: []
                        }
                    ]
                }
            };

            for (const [sport, data] of Object.entries(sportsData)) {
                const sportRef = doc(this.db, "sports", sport);
                await setDoc(sportRef, data);
            }

            console.log('Sample sports data initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing sample sports:', error);
            return false;
        }
    }

    // Initialize sample academies and programs
    async initializeSampleAcademies() {
        try {
            const academiesData = {
                'Elite Tennis Academy': {
                    email: 'info@elitetennis.com',
                    phone: '+20 123 456 789',
                    website: 'www.elitetennis.com',
                    programs: [
                        {
                            id: 'tennis-beginners',
                            name: 'Tennis for Beginners',
                            sport: 'Tennis',
                            duration: '3 months',
                            price: 2500,
                            ageGroup: '8-12 years',
                            coaches: ['Coach Ahmed', 'Coach Sarah'],
                            schedule: [
                                { day: 'Monday', time: '4:00 PM', location: 'Tennis Court 1' },
                                { day: 'Wednesday', time: '4:00 PM', location: 'Tennis Court 1' },
                                { day: 'Friday', time: '4:00 PM', location: 'Tennis Court 1' }
                            ],
                            description: 'Perfect for young beginners who want to learn tennis fundamentals.'
                        },
                        {
                            id: 'tennis-advanced',
                            name: 'Advanced Tennis Training',
                            sport: 'Tennis',
                            duration: '6 months',
                            price: 4500,
                            ageGroup: '13-18 years',
                            coaches: ['Coach Mohamed', 'Coach Lisa'],
                            schedule: [
                                { day: 'Tuesday', time: '5:00 PM', location: 'Tennis Court 2' },
                                { day: 'Thursday', time: '5:00 PM', location: 'Tennis Court 2' },
                                { day: 'Saturday', time: '3:00 PM', location: 'Tennis Court 2' }
                            ],
                            description: 'Advanced training for experienced players looking to improve their game.'
                        }
                    ]
                },
                'Champions Basketball Academy': {
                    email: 'info@championsbasketball.com',
                    phone: '+20 123 456 790',
                    website: 'www.championsbasketball.com',
                    programs: [
                        {
                            id: 'basketball-youth',
                            name: 'Youth Basketball Program',
                            sport: 'Basketball',
                            duration: '4 months',
                            price: 1800,
                            ageGroup: '10-16 years',
                            coaches: ['Coach Omar', 'Coach Fatima'],
                            schedule: [
                                { day: 'Monday', time: '6:00 PM', location: 'Basketball Court 1' },
                                { day: 'Wednesday', time: '6:00 PM', location: 'Basketball Court 1' },
                                { day: 'Saturday', time: '10:00 AM', location: 'Basketball Court 1' }
                            ],
                            description: 'Comprehensive basketball training for young athletes.'
                        }
                    ]
                },
                'Aqua Sports Academy': {
                    email: 'info@aquasports.com',
                    phone: '+20 123 456 791',
                    website: 'www.aquasports.com',
                    programs: [
                        {
                            id: 'swimming-basic',
                            name: 'Basic Swimming Course',
                            sport: 'Swimming',
                            duration: '2 months',
                            price: 1200,
                            ageGroup: '6+ years',
                            coaches: ['Coach Hassan', 'Coach Aisha'],
                            schedule: [
                                { day: 'Tuesday', time: '4:00 PM', location: 'Swimming Pool' },
                                { day: 'Thursday', time: '4:00 PM', location: 'Swimming Pool' },
                                { day: 'Sunday', time: '9:00 AM', location: 'Swimming Pool' }
                            ],
                            description: 'Learn essential swimming skills and water safety.'
                        }
                    ]
                }
            };

            for (const [academyName, data] of Object.entries(academiesData)) {
                const academyRef = doc(this.db, "academies", academyName);
                await setDoc(academyRef, data);
            }

            console.log('Sample academies data initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing sample academies:', error);
            return false;
        }
    }

    // Initialize sample user bookings
    async initializeSampleBookings() {
        try {
            const sampleBookings = [
                {
                    id: 'booking-1',
                    userId: 'current-user-id',
                    type: 'court',
                    sport: 'Tennis',
                    courtId: 'tennis-1',
                    courtName: 'Tennis Court 1',
                    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                    timeSlots: ['4:00 PM', '5:00 PM'],
                    totalPrice: 300,
                    status: 'confirmed',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'booking-2',
                    userId: 'current-user-id',
                    type: 'court',
                    sport: 'Basketball',
                    courtId: 'basketball-1',
                    courtName: 'Basketball Court 1',
                    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
                    timeSlots: ['6:00 PM', '7:00 PM'],
                    totalPrice: 240,
                    status: 'confirmed',
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
                    status: 'enrolled'
                }
            ];

            for (const booking of sampleBookings) {
                const bookingRef = doc(this.db, "bookings", booking.id);
                await setDoc(bookingRef, booking);
            }

            console.log('Sample bookings data initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing sample bookings:', error);
            return false;
        }
    }

    // Check if sample data already exists
    async checkSampleDataExists() {
        try {
            const sportsSnapshot = await getDocs(collection(this.db, "sports"));
            const academiesSnapshot = await getDocs(collection(this.db, "academies"));
            const bookingsSnapshot = await getDocs(collection(this.db, "bookings"));

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

    // Initialize all sample data
    async initializeAllSampleData() {
        try {
            const existingData = await this.checkSampleDataExists();
            
            if (!existingData.sports) {
                await this.initializeSampleSports();
            }
            
            if (!existingData.academies) {
                await this.initializeSampleAcademies();
            }
            
            if (!existingData.bookings) {
                await this.initializeSampleBookings();
            }

            console.log('All sample data initialized successfully');
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
