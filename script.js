document.addEventListener('DOMContentLoaded', () => {
    // Declare db in the outer scope
    let db;

    // Initialize Firebase (check if firebase is loaded)
    if (typeof firebase !== 'undefined') {
        const firebaseConfig = {
  apiKey: "AIzaSyAeyIVOJQT8iy6U17csyjtjBtMNXpBXHlg",
  authDomain: "art56-117a1.firebaseapp.com",
  projectId: "art56-117a1",
  storageBucket: "art56-117a1.firebasestorage.app",
  messagingSenderId: "588794156254",
  appId: "1:588794156254:web:30c2612ffb1d04142d9e4f",
  measurementId: "G-EWSQYR3MB4"
};

        try {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log("Firestore initialized successfully");
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            alert("Failed to initialize Firebase. Please refresh the page.");
            return;
        }
    } else {
        console.error("Firebase SDK not loaded. Check script tags.");
        alert("Firebase failed to load. Please refresh the page.");
        return;
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (themeToggle) {
        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.remove('light');
            body.classList.add('dark');
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light');
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // Article Form Handling (only on add-article.html)
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('articleTitle').value;
            const content = document.getElementById('articleContent').value;
            const adminPassword = "admin123@34"; // TODO: Secure this in production with Firebase Authentication

            // Prompt for password
            const password = prompt("Please enter the admin password to save the article:");
            if (password === adminPassword) {
                try {
                    // Save article to Firestore
                    await db.collection("articles").add({
                        title: title,
                        content: content,
                        createdAt: new Date().toISOString()
                    });
                    alert("Article saved!");
                    articleForm.reset();
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error("Error saving article:", error);
                    alert("Error saving article: " + error.message);
                }
            } else {
                alert("Incorrect password! Only admins can add articles.");
            }
        });
    }

    // Display Articles (only on index.html)
    const articlesContainer = document.getElementById('articlesContainer');
    const noArticlesMessage = document.getElementById('noArticlesMessage');
    if (articlesContainer && noArticlesMessage) {
        const renderArticles = async () => {
            articlesContainer.innerHTML = ''; // Clear current articles
            try {
                const snapshot = await db.collection("articles").get();
                const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (articles.length > 0) {
                    noArticlesMessage.style.display = 'none';
                    articles.forEach(article => {
                        const articleElement = document.createElement('div');
                        articleElement.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-start';
                        articleElement.innerHTML = `
                            <div>
                                <h3 class="text-xl font-semibold mb-2">${article.title}</h3>
                                <p class="text-gray-600 dark:text-gray-300">${article.content}</p>
                            </div>
                            <button class="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition" data-id="${article.id}">Delete</button>
                        `;
                        articlesContainer.appendChild(articleElement);
                    });

                    // Event delegation for delete buttons
                    articlesContainer.addEventListener('click', async (e) => {
                        if (e.target.classList.contains('delete-btn')) {
                            e.target.disabled = true; // Disable button during deletion
                            const id = e.target.getAttribute('data-id');
                            console.log("Deleting article with ID:", id);
                            try {
                                await db.collection("articles").doc(id).delete();
                                console.log("Article deleted successfully");
                                renderArticles(); // Re-render articles
                            } catch (error) {
                                console.error("Error deleting article:", error);
                                alert("Failed to delete article: " + error.message);
                            } finally {
                                e.target.disabled = false; // Re-enable button
                            }
                        }
                    }, { once: true }); // Ensure listener is added only once
                } else {
                    noArticlesMessage.style.display = 'block';
                }
            } catch (error) {
                console.error("Error loading articles:", error);
                alert("Failed to load articles: " + error.message);
            }
        };

        renderArticles();
    }
});
