const cssHtml = `
<style>
.mark-quiz {
    border: 1px dotted #777;
    border-radius: 10px;
    padding: 20px;
    background-color: #eee;
    
    article {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        margin-block: 20px;


        h3 {
           color: steelblue;  
        }
    
        label {
            display: block;
            cursor: pointer;

            input[type='checkbox'] {
            
            }
            input[type='radio'] {
            
            }
            input[type='text'] {
            
            }
        }
    }
    div.grade {
        display: flex;
        flex-direction: column;

        label.results-label {
        }

        h3.error-heading {
            color: red;
            
            &.hidden {
                display: none;
            }
        }

        ul.error-list {
            li {
                
            }
        }
        button.grade {
            align-self: end;
            min-width: 125px;
        }
    }
}
</style>
`;

class SingleChoiceQuestion {
    renderQuestion (questionElement, questionLine, childLines) {
        const questionHeader = document.createElement('h3');
        questionHeader.textContent = questionLine;
        questionElement.appendChild(questionHeader);

        for (let bodyLine of childLines) {
            let answer = bodyLine.trim();
            if (answer === '') {
                continue;
            }
            const isCorrectAnswer = answer.substring(1, 2) === 'x';

            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const radioElement   = document.createElement('input');
            radioElement.type = 'radio';
            radioElement.name = questionLine;
            radioElement.value = answer;
            if (isCorrectAnswer) {
                radioElement.dataset.correct = true;
            }
            answerLabelElement.appendChild(radioElement);

            const answerTextElement = document.createElement('span');
            answerTextElement.textContent = answer;
            answerLabelElement.appendChild(answerTextElement);

            questionElement.appendChild(answerLabelElement);
        }
    }

    checkAnswer (questionElement) {
        const correctAnswerElement = questionElement.querySelector('input[data-correct]');
        return { correct: correctAnswerElement?.checked };
    }
}

class MultipleChoiceQuestion {
    renderQuestion (questionElement, questionLine, childLines) {
        const questionHeader = document.createElement('h3');
        questionHeader.textContent = questionLine;
        questionElement.appendChild(questionHeader);

        for (let bodyLine of childLines) {
            let answer = bodyLine.trim();
            if (answer === '') {
                continue;
            }
            const isCorrectAnswer = answer.substring(1, 2) === 'x';
            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const checkboxElement = document.createElement('input');
            checkboxElement.type = 'checkbox';
            checkboxElement.name = questionLine;
            checkboxElement.value = answer;
            if (isCorrectAnswer) {
                checkboxElement.dataset.correct = true;
            }
            
            answerLabelElement.appendChild(checkboxElement);

            const answerTextElement = document.createElement('span');
            answerTextElement.textContent = answer;
            answerLabelElement.appendChild(answerTextElement);

            questionElement.appendChild(answerLabelElement);
        }           
    }

    checkAnswer (questionElement) {
        const correctAnswerElements = questionElement.querySelectorAll('input[data-correct]');
        const incorrectAnswerElements = questionElement.querySelectorAll('input:not([data-correct])');

        for (let correctAnswerElement of correctAnswerElements) {
            if (!correctAnswerElement.checked) {
                return { correct: false };
            }
        }

        for (let incorrectAnswerElement of incorrectAnswerElements) {
            if (incorrectAnswerElement.checked) {
                return { correct: false };
            }
        }
        return { correct: true };
    }
}

class FreeTextQuestion {
    renderQuestion (questionElement, questionLine, childLines) {
        const questionHeader = document.createElement('h3');
        questionHeader.textContent = questionLine;
        questionElement.appendChild(questionHeader);

        for (let bodyLine of childLines) {
            let answer = bodyLine.trim();
            if (answer === '') {
                continue;
            }
            // correct answer is between brackets
            const correctAnswer = answer.substring(answer.indexOf('[') + 1, answer.indexOf(']'));
            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const textBoxElement = document.createElement('input');
            textBoxElement.type = 'text';
            textBoxElement.name = questionLine;
            textBoxElement.dataset.correct = correctAnswer;
            
            answerLabelElement.appendChild(textBoxElement);

            questionElement.appendChild(answerLabelElement);
        }                
    }

    checkAnswer (questionElement) {
        const correctAnswer = questionElement.querySelector('input').dataset.correct;
        const userAnswer = questionElement.querySelector('input').value;
        if (correctAnswer === userAnswer) {
            return { correct: true };
        }
        return { correct: false };
    }
}

const questionProcessors = {
    '1': new SingleChoiceQuestion(),
    'n': new MultipleChoiceQuestion(),
    '_': new FreeTextQuestion()
};

class MarkQuiz extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render () {
        this.shadowRoot.innerHTML = `<slot></slot>`;
        const slot = this.shadowRoot.querySelector('slot');
        slot.addEventListener('slotchange', () => {
            const assignedNodes = slot.assignedNodes();
            assignedNodes.forEach(node => {
                if (node.nodeType == Node.TEXT_NODE) {
                    const quizElement = this.translateQuizCode(node.textContent);
                    this.shadowRoot.innerHTML = cssHtml;
                    this.shadowRoot.appendChild(quizElement);
                }
            });
        });
    }

    translateQuizCode (quizMarkdown) {
        let quizElement = document.createElement('section');
        quizElement.classList.add('mark-quiz');
        const lines = quizMarkdown.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#')) {
                const questionType = line[1];
                const questionLine = line.substring(2).trim();

                const questionElement = document.createElement('article');
                
                questionElement.dataset.questionType = questionType;
                
                const questionBodyLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    const bodyLine = lines[j].trim();
                    if (bodyLine.startsWith('#')) {
                        i = j - 1;
                        break;
                    }
                    questionBodyLines.push(bodyLine);
                }

                questionProcessors[questionType].renderQuestion(questionElement, questionLine, questionBodyLines);
                quizElement.appendChild(questionElement);
            }
        }
        const gradeDiv = document.createElement('div');
        gradeDiv.classList.add('grade');

        const gradeLabel = document.createElement('label');
        gradeLabel.classList.add('results-label')

        const gradeErrorHeading = document.createElement('h3');
        gradeErrorHeading.classList.add('error-heading');
        gradeErrorHeading.classList.add('hidden');
        gradeErrorHeading.innerText = 'You missed the following questions';

        const gradeErrorList = document.createElement('ul');
        gradeErrorList.classList.add('error-list');

        const gradeButton = document.createElement('button');
        gradeButton.textContent = 'Grade Quiz';
        gradeButton.classList.add('grade');
        gradeButton.onclick = () => {
            let score = 0;
            gradeErrorList.innerHTML = '';
            gradeErrorHeading.classList.add('hidden');
            
            const questions = quizElement.querySelectorAll('article');
            questions.forEach(questionElement => {
                const result = questionProcessors[questionElement.dataset.questionType].checkAnswer(questionElement);
                if (result.correct) {
                    score++;
                } else {
                    gradeErrorHeading.classList.remove('hidden');
                    const li = document.createElement('li');
                    li.innerText = questionElement.querySelector('h3').innerText;
                    gradeErrorList.appendChild(li);
                }
            });
            gradeLabel.innerText = `Your score is ${score} out of ${questions.length}`;
        };
       
        gradeDiv.appendChild(gradeButton);
        gradeDiv.appendChild(gradeLabel);
        gradeDiv.appendChild(gradeErrorHeading);
        gradeDiv.appendChild(gradeErrorList);
      
        quizElement.appendChild(gradeDiv);
        return quizElement;
    }
}

customElements.define('mark-quiz', MarkQuiz);
