document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

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

    // Article Form Handling (only on add-article.html)
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('articleTitle').value;
            const content = document.getElementById('articleContent').value;
            const adminPassword = "admin123"; // Hardcoded for demo; use secure storage in production

            // Prompt for password
            const password = prompt("Please enter the admin password to save the article:");
            if (password === adminPassword) {
                // Save article to localStorage
                let articles = JSON.parse(localStorage.getItem('articles')) || [];
                articles.push({ title, content, id: Date.now() });
                localStorage.setItem('articles', JSON.stringify(articles));

                // Clear form and redirect to in.html
                articleForm.reset();
                window.location.href = 'in.html';
            } else {
                alert("Incorrect password! Only admins can add articles.");
            }
        });
    }

    // Display Articles (only on in.html)
    const articlesContainer = document.getElementById('articlesContainer');
    const noArticlesMessage = document.getElementById('noArticlesMessage');
    if (articlesContainer && noArticlesMessage) {
        const renderArticles = () => {
            // Clear current articles
            articlesContainer.innerHTML = '';
            const articles = JSON.parse(localStorage.getItem('articles')) || [];
            
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
                    button.addEventListener('click', (e) => {
                        const id = Number(e.target.getAttribute('data-id'));
                        let articles = JSON.parse(localStorage.getItem('articles')) || [];
                        articles = articles.filter(article => article.id !== id);
                        localStorage.setItem('articles', JSON.stringify(articles));
                        renderArticles(); // Re-render articles
                    });
                });
            } else {
                noArticlesMessage.style.display = 'block';
            }
        };

        renderArticles();
    }
});