/**
 Style header for the component

 @type {string}
 */
const cssHtml = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
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

        div.question {}
    
        label {
            display: flex;
            align-items: baseline;
            gap: 10px;
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


/**
 * Abstract class for markdown question types
 */
class MarkQuestionHandler {
    /**
     * Renders a question of this type
     *
     * @param {HTMLElement} _questionElement Element to render onto
     * @param {string} _questionContent Question content
     * @param {string[]} _answers Answer content list
     */
    renderQuestion (_questionElement, _questionContent, _answers) {
        throw new Error('Can not instantiate abstract class');
    }

    /**
     * Check an answer
     * 
     * @param {HTMLElement} _questionElement Element to render onto
     * @returns {{ correct: boolean }}
     */
    checkAnswer(_questionElement) {
        throw new Error('Not implemented');
    }
}

/**
 * Handler for free form entry questions
 */
export class SingleChoiceQuestionHandler extends MarkQuestionHandler {
    /**
     * Renders a question of this type
     *
     * @param {HTMLElement} questionElement Element to render onto
     * @param {string} questionContent Question content
     * @param {string[]} answers Answer content list
     */
    renderQuestion (questionElement, questionContent, answers) {
        const questionHeader = document.createElement('div');
        questionHeader.classList.add('question');
        questionHeader.innerHTML = markQuizConfig.processQuestionText(questionContent);
        questionElement.appendChild(questionHeader);

        for (let answer of answers) {
            const isCorrectAnswer = answer.substring(1, 2) === 'x';
            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const radioElement   = document.createElement('input');
            radioElement.type = 'radio';
            radioElement.name = questionContent;
            radioElement.value = answer;
            if (isCorrectAnswer) {
                radioElement.dataset.correct = 'true';
            }
            answerLabelElement.appendChild(radioElement);

            const answerTextElement = document.createElement('span');
            answerTextElement.innerHTML = markQuizConfig.processAnswerText(answer);
            answerLabelElement.appendChild(answerTextElement);

            questionElement.appendChild(answerLabelElement);
        }
    }

    /**
     * Check an answer
     * 
     * @param {HTMLElement} questionElement Element to render onto
     * @returns {{ correct: boolean }}
     */
    checkAnswer (questionElement) {
        const correctAnswerElement = questionElement.querySelector('input[data-correct]');
        return { correct: /** @type {HTMLInputElement} */ (correctAnswerElement)?.checked };
    }
}

/**
 * Handler for multiple choice questions (check all that apply)
 */
export class MultipleChoiceQuestionHandler extends MarkQuestionHandler {
    /**
     * Renders a question of this type
     *
     * @param {HTMLElement} questionElement Element to render onto
     * @param {string} questionContent Question content
     * @param {string[]} answers Answer content list
     */
    renderQuestion (questionElement, questionContent, answers) {
        const questionHeader = document.createElement('div');
        questionHeader.classList.add('question');
        questionHeader.innerHTML = markQuizConfig.processQuestionText(questionContent);
        questionElement.appendChild(questionHeader);

        for (let answer of answers) {
            const isCorrectAnswer = answer.substring(1, 2) === 'x';
            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const checkboxElement = document.createElement('input');
            checkboxElement.type = 'checkbox';
            checkboxElement.name = questionContent;
            checkboxElement.value = answer;
            if (isCorrectAnswer) {
                checkboxElement.dataset.correct = 'true';
            }
            
            answerLabelElement.appendChild(checkboxElement);

            const answerTextElement = document.createElement('span');
            answerTextElement.innerHTML = markQuizConfig.processAnswerText(answer);
            answerLabelElement.appendChild(answerTextElement);

            questionElement.appendChild(answerLabelElement);
        }           
    }

    /**
     * Check an answer
     * 
     * @param {HTMLElement} questionElement Element to render onto
     * @returns {{ correct: boolean }}
     */
    checkAnswer (questionElement) {
        const correctAnswerElements = questionElement.querySelectorAll('input[data-correct]');
        const incorrectAnswerElements = questionElement.querySelectorAll('input:not([data-correct])');

        for (let correctAnswerElement of correctAnswerElements) {
            if (!/** @type {HTMLInputElement} */(correctAnswerElement).checked) {
                return { correct: false };
            }
        }

        for (let incorrectAnswerElement of incorrectAnswerElements) {
            if (/** @type {HTMLInputElement} */(incorrectAnswerElement).checked) {
                return { correct: false };
            }
        }
        return { correct: true };
    }
}

/**
 * Handler for free form entry questions
 */
export class FreeTextQuestionHandler extends MarkQuestionHandler {
    /**
     * Renders a question of this type
     *
     * @param {HTMLElement} questionElement Element to render onto
     * @param {string} questionContent Question content
     * @param {string[]} answers Answer content list
     */
    renderQuestion (questionElement, questionContent, answers) {
        const questionHeader = document.createElement('div');
        questionHeader.classList.add('question');
        questionHeader.innerHTML = markQuizConfig.processQuestionText(questionContent);
        questionElement.appendChild(questionHeader);

        for (let answer of answers) {
            const correctAnswer = answer.substring(answer.indexOf('[') + 1, answer.indexOf(']'));
            answer = answer.substring(3).trim();

            const answerLabelElement = document.createElement('label');
            const textBoxElement = document.createElement('input');
            textBoxElement.type = 'text';
            textBoxElement.name = questionContent;
            textBoxElement.dataset.correct = correctAnswer;
            
            answerLabelElement.appendChild(textBoxElement);

            questionElement.appendChild(answerLabelElement);
        }                
    }

    /**
     * Check an answer
     * 
     * @param {HTMLElement} questionElement Element to render onto
     * @returns {{ correct: boolean }}
     */
    checkAnswer (questionElement) {
        const correctAnswer = questionElement.querySelector('input').dataset.correct;
        const userAnswer = questionElement.querySelector('input').value;
        if (correctAnswer === userAnswer) {
            return { correct: true };
        }
        return { correct: false };
    }
}

/**
 * Configuration Object for markdown
 */
export const markQuizConfig = {
    questionProcessors: {
        '1': new SingleChoiceQuestionHandler(),
        'n': new MultipleChoiceQuestionHandler(),
        '_': new FreeTextQuestionHandler()
    },
    processQuestionText: (/** @type {string} */ text) => text.replace('\n', '<br>'),
    processAnswerText: (/** @type {string} */ text) => text.replace('\n', '<br>')
};

/**
 * MarkQuiz Web Component class
 */
export class MarkQuiz extends HTMLElement {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    /**
     * Render this component
     */
    render() {
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

    /** 
     * Translate quiz code to interactive HTML quiz
     *
     * @param {string} quizCode quiz code
     */
    translateQuizCode(quizCode) {
        let quizElement = document.createElement('section');
        quizElement.classList.add('mark-quiz');
        const lines = quizCode.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let questionContent = lines[i];

            if (!questionContent.trim().startsWith('#')) {
                continue;
            }

            let questionIndent = this.countIndent(questionContent);
            questionContent = this.removeIndent(questionContent, questionIndent);

            for (let j = i + 1; j < lines.length; j++){
                const additionalLine = lines[j];

                if (additionalLine.trim().startsWith('[') || additionalLine.trim().startsWith('#')) {
                    break;
                }
                questionContent += '\n' + this.removeIndent(additionalLine, questionIndent);
                i = j;
            }
            if (i >= lines.length) break;

            let answers = [];
            
            for (let j = i + 1; j < lines.length; j++){
                const additionalLine = lines[j]

                if (!additionalLine.trim().startsWith('[')) {
                    continue;
                }
                let currentAnswerContent = this.removeIndent(additionalLine, questionIndent);

                for (let k = j + 1; k < lines.length; k++){
                    const additionalLine = lines[k]

                    if (additionalLine.trim().startsWith('[') || additionalLine.trim().startsWith('#')) {
                        break;
                    }
                    currentAnswerContent += '\n' + this.removeIndent(additionalLine, questionIndent);
                    i = k;
                    j = k;
                }
                answers.push(currentAnswerContent.trim());
                i = j;

                if (lines[j+1]?.trim().startsWith('#')) {
                    break;
                }

                if (i >= lines.length) break;
            }
            if (i >= lines.length) break;

            questionContent = questionContent.trim();

            const questionType = questionContent[1];
            questionContent = questionContent.substring(2);

            console.log(questionContent);
            console.log(answers);

            const questionElement = document.createElement('article');
            questionElement.dataset.questionType = questionType;
            markQuizConfig.questionProcessors[questionType].renderQuestion(questionElement, questionContent, answers);
            quizElement.appendChild(questionElement);
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
                const result = markQuizConfig.questionProcessors[questionElement.dataset.questionType].checkAnswer(questionElement);
                if (result.correct) {
                    score++;
                } else {
                    gradeErrorHeading.classList.remove('hidden');
                    const li = document.createElement('li');
                    li.innerText = /** @type HTMLElement */(questionElement.querySelector('.question')).innerText;
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

    /**
     * Count how many spaces are at the start of a string
     *
     * @param {string} str 
     * @returns {number} The number of spaces at the start of the string
     */
    countIndent(str) {
        let count = 0;
        for (; count < str.length && str[count] == ' '; count++);
        return count;
    } 


    /**
     * Remove x spaces from start of string
     * 
     * @param {string} str String to remove spaces from
     * @param {number} count Spaces to remove
     * @returns {string} String with spaces removed
     */
    removeIndent(str, count) {
        return (this.countIndent(str) >= count) ? str.substring(count) : str;
    }
}

customElements.define('mark-quiz', MarkQuiz);
