import fs from 'fs';
import path from 'path';

class IELTSTest {
  constructor() {
    // Load questions from JSON file
    const questionsPath = path.join(process.cwd(), 'json', 'questions.json');
    this.questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    this.reset();
  }

  reset() {
    this.currentPart = 'part1';
    this.currentQuestionSet = this.getRandomQuestionSet(this.questions[this.currentPart]);
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.currentQuestionSet[this.currentQuestionIndex];
    this.answers = [];
  }

  getRandomQuestionSet(questionSets) {
    return questionSets[Math.floor(Math.random() * questionSets.length)];
  }

  processAnswer(answer) {
    // Store the answer
    this.answers.push({
      part: this.currentPart,
      question: this.currentQuestion,
      answer: answer
    });

    // Progress through test parts
    if (this.currentPart === 'part1') {
      this.currentQuestionIndex++;
      
      if (this.currentQuestionIndex < this.currentQuestionSet.length) {
        // Move to next question in part 1
        this.currentQuestion = this.currentQuestionSet[this.currentQuestionIndex];
        return {
          completed: false,
          currentPart: this.currentPart,
          currentQuestion: this.currentQuestion
        };
      } else {
        // Move to part 2
        this.currentPart = 'part2';
        this.currentQuestion = this.getRandomQuestion(this.questions['part2']);
        return {
          completed: false,
          currentPart: this.currentPart,
          currentQuestion: this.currentQuestion
        };
      }
    } else if (this.currentPart === 'part2') {
      // Move to part 3
      this.currentPart = 'part3';
      this.currentQuestionSet = this.getRandomQuestionSet(this.questions['part3']);
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.currentQuestionSet[this.currentQuestionIndex];
      
      return {
        completed: false,
        currentPart: this.currentPart,
        currentQuestion: this.currentQuestion
      };
    } else if (this.currentPart === 'part3') {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.currentQuestionSet.length) {
            // Move to next question in part 1
            this.currentQuestion = this.currentQuestionSet[this.currentQuestionIndex];
            return {
              completed: false,
              currentPart: this.currentPart,
              currentQuestion: this.currentQuestion
            };
        }
      return {
        completed: true,
        answers: this.answers
      };
    }
  }

  getRandomQuestion(questions) {
    return questions[Math.floor(Math.random() * questions.length)];
  }
}

export default IELTSTest;