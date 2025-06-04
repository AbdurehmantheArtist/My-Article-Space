document.addEventListener('DOMContentLoaded', () => {
    // Declare db in the outer scope
    let db;

    // Initialize Firebase (check if firebase is loaded)
    if (typeof firebase !== 'undefined') {
        const firebaseConfig = {
            apiKey: "AIzaSyBKd5uT_ZAqRonOxzKFOkhKJIZ-xBzK9Pg",
            authDomain: "articlestorage-ed7cd.firebaseapp.com",
            projectId: "articlestorage-ed7cd",
            storageBucket: "articlestorage-ed7cd.firebasestorage.app",
            messagingSenderId: "861819296403",
            appId: "1:861819296403:web:912e284746affb5cbe4b66"
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
            const adminPassword = "admin123"; // Secure this in production

            // Prompt for password
            const password = prompt("Please enter the admin password to save the article:");
            if (password === adminPassword) {
                try {
                    // Save article to Firestore
                    await db.collection("articles").add({
                        title: title,
                        content: content,
                        id: Date.now(), // Unique ID
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

                    // Add event listeners to delete buttons
                    document.querySelectorAll('.delete-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const id = e.target.getAttribute('data-id');
                            try {
                                await db.collection("articles").doc(id).delete();
                                renderArticles(); // Re-render articles
                            } catch (error) {
                                console.error("Error deleting article:", error);
                            }
                        });
                    });
                } else {
                    noArticlesMessage.style.display = 'block';
                }
            } catch (error) {
                console.error("Error loading articles:", error);
            }
        };

        renderArticles();
    }
});
