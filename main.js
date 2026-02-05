class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'lotto-generator');

        const title = document.createElement('h1');
        title.textContent = 'Lotto Number Generator';

        const numbersContainer = document.createElement('div');
        numbersContainer.setAttribute('class', 'numbers');

        const button = document.createElement('button');
        button.textContent = 'Generate Numbers';
        button.addEventListener('click', () => this.generateNumbers(numbersContainer));

        const style = document.createElement('style');
        style.textContent = `
            .lotto-generator {
                text-align: center;
                border: 1px solid var(--lotto-border-color);
                padding: 2rem;
                border-radius: 10px;
                background-color: var(--lotto-bg-color);
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                transition: background-color 0.3s, border-color 0.3s;
            }
            h1 {
                margin-bottom: 2rem;
                color: var(--text-color);
            }
            .numbers {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .number {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--number-bg-color);
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--text-color);
                transition: background-color 0.3s, color 0.3s;
            }
            button {
                background-color: var(--button-bg-color);
                color: var(--text-color);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.3s, box-shadow 0.3s, color 0.3s;
            }
            button:hover {
                background-color: var(--button-hover-bg-color);
                box-shadow: 0 0 15px var(--button-shadow-color);
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(title);
        wrapper.appendChild(numbersContainer);
        wrapper.appendChild(button);

        this.generateNumbers(numbersContainer);
    }

    generateNumbers(container) {
        container.innerHTML = '';
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

        for (const number of sortedNumbers) {
            const numberElement = document.createElement('div');
            numberElement.setAttribute('class', 'number');
            numberElement.textContent = number;
            container.appendChild(numberElement);
        }
    }
}


customElements.define('lotto-generator', LottoGenerator);

// Theme switching logic
document.addEventListener('DOMContentLoaded', () => {
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

