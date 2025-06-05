import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App'; // Assuming App is the default export from App.jsx
import * as utils from './utils';

// --- Aggressive Mocks ---

// Mock ./firebase/config.js
// This path is relative to the files that import it (e.g. App.jsx)
// Vitest's vi.mock uses paths relative to the test file or absolute paths/node_modules.
// If App.jsx uses "./firebase/config", and App.test.jsx is in the same dir as App.jsx,
// then "./firebase/config" should work here.
vi.mock('./firebase/config', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => () => {}), // Returns an unsubscribe function
    currentUser: null,
    // Add any other auth properties/methods App.jsx or its children might expect from this specific auth object
  },
  db: {
    // Add any db properties/methods App.jsx or its children might expect
  },
  // googleProvider: {}, // If used
  // signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid', displayName: 'Test User' } })),
  // signOut: vi.fn(() => Promise.resolve()),
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    onAuthStateChanged: vi.fn(() => () => {}), // Returns an unsubscribe function
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    signOut: vi.fn(() => Promise.resolve()),
    // Add any other auth functions needed
  })),
  GoogleAuthProvider: vi.fn(() => ({})), // If used
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid', displayName: 'Test User' } })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(() => () => {}), // Also mock top-level if used directly
  // Add any other specific exports used, e.g., EmailAuthProvider, etc.
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    // Add any methods expected on the db instance from getFirestore()
  })),
  collection: vi.fn(() => ({
    // Add any methods expected on a collection reference
    // For example, if `collection(db, 'scores').orderBy(...)` is used
    orderBy: vi.fn(() => ({})),
    limit: vi.fn(() => ({})),
  })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  serverTimestamp: vi.fn(() => new Date()), // Or a specific mock date object
  query: vi.fn(() => ({})), // Return a mock query object
  orderBy: vi.fn(() => ({})), // Mock top-level orderBy as well
  limit: vi.fn(() => ({})),   // Mock top-level limit as well
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })), // Default to no documents
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn(date => ({ toDate: () => date })),
  },
  // Add other functions like where, updateDoc, deleteDoc if they are called
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" /> // Render a simple div
}));

// Mock ./utils (keep this similar to previous attempts for App.jsx needs)
vi.mock('./utils', async (importOriginal) => {
  const actualUtils = await importOriginal();
  return {
    ...actualUtils,
    setUpCards: vi.fn().mockReturnValue([]), // Default to empty array
    shuffleCards: vi.fn(cards => cards),
    calculateGameDuration: vi.fn(() => '00:00'),
    calculateAccuracy: vi.fn(() => 100),
  };
});

// Mock window.confirm
global.window.confirm = vi.fn();


// --- Test Suite ---
describe('App.jsx Tests (Attempt 1)', () => {
  beforeEach(async () => { // Added async here
    // Reset mocks before each test
    vi.clearAllMocks(); // Clears call counts, etc.

    // Default mock implementations for functions
    utils.setUpCards.mockReturnValue([]);
    window.confirm.mockReturnValue(true);

    // Reset Firebase auth state for each test (if App logic depends on it)
    // This requires access to the mocked auth object or its functions.
    // For example, if checking auth.currentUser in App.jsx, ensure it's reset.
    // The mocks define onAuthStateChanged to have currentUser as null initially by default.
    // We will import the mocked versions and modify their state as needed.
    const { getAuth } = await vi.importActual('firebase/auth'); // Get the mocked getAuth
    const { auth: configAuth } = await vi.importActual('./firebase/config'); // Get the mocked configAuth

    // Default to logged out for most tests unless overridden
    if (vi.mocked(getAuth)()) { // Check if getAuth() itself is not null (it returns an object)
        vi.mocked(getAuth)().currentUser = null;
    }
    if (configAuth) {
        configAuth.currentUser = null;
    }
  });

  // Basic test to see if initial render works without ESM error
  it('should render Login screen when not authenticated and navigating to /', async () => {
    const { getAuth } = await vi.importActual('firebase/auth');
    const { auth: configAuth } = await vi.importActual('./firebase/config');
    vi.mocked(getAuth)().currentUser = null;
    configAuth.currentUser = null;

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // ProtectedRoute should redirect to /login
    await waitFor(() => {
      // Assuming Login component has a form with an email input
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
  });

  it('should render Levels component if user is authenticated and navigating to /', async () => {
    const { getAuth } = await vi.importActual('firebase/auth');
    const { auth: configAuth } = await vi.importActual('./firebase/config');
    const mockUser = { uid: 'test-user' };
    vi.mocked(getAuth)().currentUser = mockUser;
    configAuth.currentUser = mockUser;

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // If authenticated, ProtectedRoute should allow rendering Game, which starts with Levels
    await waitFor(() => {
        expect(screen.getByText(/select level/i)).toBeInTheDocument();
        expect(screen.getByText(/easy/i)).toBeInTheDocument();
    });
  });

  // Add one game interaction test if the above passes
  it('should initialize game when a level is selected, if authenticated', async () => {
    // Authenticate user
    const authMock = await vi.importActual('firebase/auth');
    authMock.getAuth.mockReturnValue({
        currentUser: { uid: 'test-user' },
        onAuthStateChanged: vi.fn(() => () => {}),
    });
     const configAuthMock = await vi.importActual('./firebase/config');
    configAuthMock.auth.currentUser = { uid: 'test-user' };

    const mockCardsData = [
      { id: 1, illPathName: 'ill-1.svg', flipped: false, matched: false, flippedCount: 0 },
      { id: 2, illPathName: 'ill-1.svg', flipped: false, matched: false, flippedCount: 0 },
    ];
    utils.setUpCards.mockReturnValue(mockCardsData);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/easy/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/easy/i)); // Assuming "Easy" text is on a button or clickable element for level selection

    await waitFor(() => {
      expect(utils.setUpCards).toHaveBeenCalled();
      // Check for GameBoard related elements.
      // This requires knowing how GameBoard and DetailCard render.
      // For now, let's just check if GameStats (which shows moves) appears.
      expect(screen.getByText(/moves:/i)).toBeInTheDocument();
    });
  });

});
