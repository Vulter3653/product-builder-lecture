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
                border: 1px solid #333;
                padding: 2rem;
                border-radius: 10px;
                background-color: #1e1e1e;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }
            h1 {
                margin-bottom: 2rem;
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
                background-color: #333;
                font-size: 1.5rem;
                font-weight: bold;
            }
            button {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.3s, box-shadow 0.3s;
            }
            button:hover {
                background-color: #0056b3;
                box-shadow: 0 0 15px rgba(0, 123, 255, 0.7);
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
