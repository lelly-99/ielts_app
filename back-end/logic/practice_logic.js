import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questions = JSON.parse(
    readFileSync(join(__dirname, '../json/questions.json'), 'utf8')
);

export default function logic() {

    function get_random_question() {
       
        const parts = Object.keys(questions);
        
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        
        if (randomPart === 'part2') {
            const randomQuestion = questions[randomPart][Math.floor(Math.random() * questions[randomPart].length)];
            
            return {
                part: randomPart,
                question: randomQuestion
            };
        } else {

            const partQuestions = questions[randomPart];
            
            const randomQuestionArray = partQuestions[Math.floor(Math.random() * partQuestions.length)];
        
            const randomQuestion = randomQuestionArray[Math.floor(Math.random() * randomQuestionArray.length)];
            
            return {
                part: randomPart,
                question: randomQuestion
            };
        }
    }

    return {
        get_random_question,
    };
}

