// Product data
const products = [
    {
        name: 'Classic T-Shirt',
        price: '$15',
        image: 'https://via.placeholder.com/250x250.png?text=T-Shirt'
    },
    {
        name: 'Denim Jeans',
        price: '$40',
        image: 'https://via.placeholder.com/250x250.png?text=Jeans'
    },
    {
        name: 'Cool Sneakers',
        price: '$60',
        image: 'https://via.placeholder.com/250x250.png?text=Sneakers'
    },
    {
        name: 'Stylish Watch',
        price: '$120',
        image: 'https://via.placeholder.com/250x250.png?text=Watch'
    },
    {
        name: 'Leather Backpack',
        price: '$80',
        image: 'https://via.placeholder.com/250x250.png?text=Backpack'
    },
    {
        name: 'Sunglasses',
        price: '$25',
        image: 'https://via.placeholder.com/250x250.png?text=Sunglasses'
    }
];

// Function to render products
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';

        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.price}</p>
        `;

        productList.appendChild(productItem);
    });
}

// Theme switching logic
document.addEventListener('DOMContentLoaded', () => {
    // Render products
    renderProducts();

    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Function to apply theme
    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
            themeToggleBtn.textContent = 'Switch to Dark Mode';
        } else {
            body.classList.remove('light-mode');
            themeToggleBtn.textContent = 'Switch to Light Mode';
        }
        localStorage.setItem('theme', theme);
    };

    // Check for saved theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
});
