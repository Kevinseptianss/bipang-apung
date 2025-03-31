import { db } from '@/config/firebase-admin'; // Import Firebase Admin SDK

export async function GET(request) {
  try {
    // Fetch all documents from the "menu" collection
    const menuRef = db.collection('menu');
    const snapshot = await menuRef.get();

    // Check if the collection is empty
    if (snapshot.empty) {
      return Response.json({ message: 'No menu items found' }, { status: 404 });
    }

    // Map documents to an array of menu items
    const menuItems = [];
    snapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });

    // Return the menu items as JSON
    return Response.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}