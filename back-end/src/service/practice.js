import axios from 'axios';
import 'dotenv/config';
import logic from '../../logic/practice_logic.js';

import { 
  getSpeakingCorrectionsPrompt, 
  getSpeakingSuggestionsPrompt, 
  getSpeakingImprovedPrompt, 
  getIsFeedbackNeededPrompt 
} from '../../speaking-evalution-prompts.js';

class AIEvaluationService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.logicInstance = logic();
  }

  async evaluateResponse(question, response) {
    try {
      const isFeedbackNeeded = await this.checkFeedbackNecessity(question, response);
      
      const nextQuestion = this.generateNextQuestion();

      if (!isFeedbackNeeded) {
        return {
          status: 'pass',
          message: this.generateDefaultFeedback(response),
          nextQuestion: this.formatQuestion(nextQuestion.question)
        };
      }

      const correctedResponse = await this.getCorrections(question, response);
      const improvementSuggestions = await this.getImprovementSuggestions(question, response);
      const improvedResponse = await this.getImprovedVersion(question, response);

      return {
        status: 'review',
        corrections: this.formatFeedback(correctedResponse, 'Corrections'),
        suggestions: this.formatFeedback(improvementSuggestions, 'Suggestions'),
        improvedVersion: this.formatFeedback(improvedResponse, 'Improved Version'),
        nextQuestion: this.formatQuestion(nextQuestion.question)
      };
    } catch (error) {
      console.error('AI Evaluation Error:', error);
      return {
        status: 'error',
        message: 'An error occurred during evaluation.'
      };
    }
  }

  generateNextQuestion() {
    return this.logicInstance.get_random_question();
  }

  formatFeedback(content, title) {
    const cleanedContent = content.replace(new RegExp(`^${title}:\\s*`, 'i'), '').trim();
    
    return this.formatMarkdown(cleanedContent);
  }

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\d+\.\s*)(.+)$/gm, '<strong>$1</strong>$2')
      .replace(/\n/g, '<br>');
  }

  formatQuestion(question) {
    const parts = question.split('\nYou should say:');
    const mainQuestion = parts[0].trim();
    const prompts = parts[1] ? 
      parts[1].split('\n')
        .filter(prompt => prompt.trim() !== '')
        .map(prompt => prompt.trim())
      : [];

    let formattedHTML = `<strong>${mainQuestion}</strong><br><br>`;
    
    if (prompts.length > 0) {
      formattedHTML += "You should say:<br>";
      prompts.forEach((prompt) => {
        formattedHTML += `• ${prompt}<br>`;
      });
    }

    return formattedHTML;
  }

  async makeOpenAIRequest(prompt, maxTokens = 150) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async checkFeedbackNecessity(question, response) {
    const prompt = getIsFeedbackNeededPrompt(question, response);
    
    const result = await this.makeOpenAIRequest(prompt, 10);
    return result.toLowerCase() === 'no';
  }

  async getCorrections(question, response) {
    const prompt = getSpeakingCorrectionsPrompt(question, response);
    return this.makeOpenAIRequest(prompt);
  }

  async getImprovementSuggestions(question, response) {
    const prompt = getSpeakingSuggestionsPrompt(question, response);
    return this.makeOpenAIRequest(prompt, 250);
  }

  async getImprovedVersion(question, response) {
    const prompt = getSpeakingImprovedPrompt(question, response);
    return this.makeOpenAIRequest(prompt, 250);
  }
}

export default new AIEvaluationService();