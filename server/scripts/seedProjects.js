const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if needed (though we use serviceAccountKey mostly)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Path to Service Account Key
// ASSUMPTION: The user has placed 'serviceAccountKey.json' in the project root or server root.
// Adjust the path if necessary. We'll try to find it in the server root first.
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Error: serviceAccountKey.json not found at ${serviceAccountPath}`);
    console.error('Please download your service account key from Firebase Console -> Project Settings -> Service accounts, rename it to "serviceAccountKey.json", and place it in the server directory.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const seedProjects = async () => {
    try {
        const projectsPath = path.join(__dirname, 'projects.json');
        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        if (!Array.isArray(projectsData)) {
            throw new Error('projects.json must contain an array of project objects.');
        }

        const collectionRef = db.collection('project');

        // Delete existing projects first
        console.log('🗑️  Deleting existing projects...');
        const existingDocs = await collectionRef.get();
        if (!existingDocs.empty) {
            const deleteBatch = db.batch();
            existingDocs.forEach(doc => {
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();
            console.log(`   Deleted ${existingDocs.size} old projects.`);
        }

        console.log(`📦 Seeding ${projectsData.length} new projects...`);

        const batch = db.batch();
        let count = 0;
        for (const project of projectsData) {
            const docRef = collectionRef.doc();
            const docData = {
                ...project,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            batch.set(docRef, docData);
            count++;
        }

        await batch.commit();

        console.log(`✅ Successfully seeded ${count} projects into 'project' collection.`);

    } catch (error) {
        console.error('❌ Error seeding projects:', error);
    } finally {
        process.exit();
    }
};

seedProjects();
