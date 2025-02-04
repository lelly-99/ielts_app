// ai_feedback.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIFeedbackGenerator {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateFeedback(answers) {
    try {
      const comprehensiveFeedback = {
        overallPerformance: {},
        detailedAnalysis: {},
        aiGeneratedFeedback: null
      };

      for (const part of ['part1', 'part2', 'part3']) {
        const partAnswers = answers.filter(a => a.part === part);
        comprehensiveFeedback.detailedAnalysis[part] = this._analyzePartAnswers(part, partAnswers);
      }

      comprehensiveFeedback.overallPerformance = this._calculateOverallPerformance(comprehensiveFeedback.detailedAnalysis);

      comprehensiveFeedback.aiGeneratedFeedback = await this._generateComprehensiveFeedback(comprehensiveFeedback);

      return comprehensiveFeedback;
    } catch (error) {
      console.error('Feedback Generation Error:', error);
      return { error: 'Failed to generate feedback' };
    }
  }

  _analyzePartAnswers(part, answers) {
    return {
      questions: answers.map(a => a.question),
      responses: answers.map(a => a.answer),
      analysis: {
        fluencyCoherence: this._analyzeFluencyCoherence(answers),
        lexicalResource: this._analyzeLexicalResource(answers),
        topicalRelevance: this._analyzeTopicalRelevance(answers),
        grammaticalAccuracy: this._analyzeGrammaticalAccuracy(answers),
        responseDepth: this._analyzeResponseDepth(answers)
      }
    };
  }

  _analyzeFluencyCoherence(answers) {
    const speechAnalysis = answers.map(answer => {
      const sentences = answer.answer.split(/[.!?]+/).filter(s => s.trim());
      return {
        sentenceCount: sentences.length,
        averageSentenceLength: sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length,
        coherenceScore: this._calculateCoherenceScore(answer.answer)
      };
    });

    return {
      averageSentenceCount: speechAnalysis.reduce((sum, analysis) => sum + analysis.sentenceCount, 0) / speechAnalysis.length,
      averageSentenceLength: speechAnalysis.reduce((sum, analysis) => sum + analysis.averageSentenceLength, 0) / speechAnalysis.length,
      overallCoherenceScore: speechAnalysis.reduce((sum, analysis) => sum + analysis.coherenceScore, 0) / speechAnalysis.length
    };
  }

  _calculateCoherenceScore(answer) {
    const transitionWords = ['however', 'moreover', 'furthermore', 'in addition', 'consequently'];
    const hasTransitionWords = transitionWords.some(word => answer.toLowerCase().includes(word));
    
    const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim()).length;
    
    return (hasTransitionWords ? 1 : 0) + (sentenceCount > 2 ? 1 : 0);
  }

  _analyzeLexicalResource(answers) {
    const vocabularyAnalysis = answers.map(answer => {
      const words = answer.answer.toLowerCase().match(/\b\w+\b/g) || [];
      const uniqueWords = new Set(words);
      
      return {
        totalWords: words.length,
        uniqueWords: uniqueWords.size,
        vocabularyDiversity: uniqueWords.size / words.length
      };
    });

    return {
      averageWordCount: vocabularyAnalysis.reduce((sum, analysis) => sum + analysis.totalWords, 0) / vocabularyAnalysis.length,
      averageUniqueness: vocabularyAnalysis.reduce((sum, analysis) => sum + analysis.vocabularyDiversity, 0) / vocabularyAnalysis.length
    };
  }

  _analyzeTopicalRelevance(answers) {
    return answers.map(answer => {
      const keywordMatch = this._checkQuestionRelevance(answer.question, answer.answer);
      
      return {
        question: answer.question,
        relevanceScore: keywordMatch ? 1 : 0
      };
    });
  }

  _checkQuestionRelevance(question, answer) {
    const questionWords = question.toLowerCase().match(/\b\w+\b/g) || [];
    const answerWords = answer.toLowerCase().match(/\b\w+\b/g) || [];

    const matchedWords = questionWords.filter(word => 
      answerWords.includes(word) && 
      !['is', 'are', 'was', 'were', 'do', 'does', 'did'].includes(word)
    );

    return matchedWords.length > 0;
  }

  _analyzeGrammaticalAccuracy(answers) {
    const grammaticalAnalysis = answers.map(answer => {
      const errors = this._detectGrammaticalErrors(answer.answer);
      
      return {
        totalErrors: errors.length,
        errorTypes: errors
      };
    });
  
    return {
      averageErrorCount: grammaticalAnalysis.reduce((sum, analysis) => sum + analysis.totalErrors, 0) / grammaticalAnalysis.length,
      commonErrorTypes: this._aggregateErrorTypes(grammaticalAnalysis)
    };
  }
  
  _aggregateErrorTypes(grammaticalAnalysis) {
    const allErrorTypes = grammaticalAnalysis.flatMap(analysis => analysis.errorTypes);
    
    const errorTypeCounts = allErrorTypes.reduce((acc, errorType) => {
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {});
  
    return Object.entries(errorTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  _detectGrammaticalErrors(answer) {
    const errorPatterns = [
      { type: 'Subject-Verb Agreement', regex: /\b(is|are|was|were)\b.*\b(is|are|was|were)\b/ },
      { type: 'Pronoun Usage', regex: /\b(me|him|her) (is|are)\b/ },
      { type: 'Tense Inconsistency', regex: /\b(present|past|future)\b.*\b(present|past|future)\b/ }
    ];

    return errorPatterns
      .filter(pattern => pattern.regex.test(answer))
      .map(pattern => pattern.type);
  }

  _analyzeResponseDepth(answers) {
    return answers.map(answer => {
      const sentenceCount = answer.answer.split(/[.!?]+/).filter(s => s.trim()).length;
      const wordCount = answer.answer.match(/\b\w+\b/g)?.length || 0;

      return {
        sentenceCount,
        wordCount,
        depthScore: sentenceCount > 2 && wordCount > 50 ? 'Deep' : 'Shallow'
      };
    });
  }

  async _generateComprehensiveFeedback(comprehensiveFeedback) {
    try {
      const prompt = this._constructFeedbackPrompt(comprehensiveFeedback);

      const response = await axios.post(
        this.baseUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system", 
              content: "You are an IELTS speaking examiner providing detailed, constructive feedback."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 350,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Feedback Generation Error:', error.response ? error.response.data : error.message);
      return "Unable to generate detailed feedback.";
    }
  }

  _constructFeedbackPrompt(comprehensiveFeedback) {
    const { detailedAnalysis, overallPerformance } = comprehensiveFeedback;

    return `
      Provide a comprehensive IELTS speaking test feedback based on the following detailed analysis:

      Part 1 Performance:
      - Fluency: ${JSON.stringify(detailedAnalysis.part1.analysis.fluencyCoherence)}
      - Vocabulary: ${JSON.stringify(detailedAnalysis.part1.analysis.lexicalResource)}
      - Topical Relevance: ${JSON.stringify(detailedAnalysis.part1.analysis.topicalRelevance)}
      - Grammar: ${JSON.stringify(detailedAnalysis.part1.analysis.grammaticalAccuracy)}
      - Response Depth: ${JSON.stringify(detailedAnalysis.part1.analysis.responseDepth)}

      Part 2 Performance:
      - Fluency: ${JSON.stringify(detailedAnalysis.part2.analysis.fluencyCoherence)}
      - Vocabulary: ${JSON.stringify(detailedAnalysis.part2.analysis.lexicalResource)}
      - Topical Relevance: ${JSON.stringify(detailedAnalysis.part2.analysis.topicalRelevance)}
      - Grammar: ${JSON.stringify(detailedAnalysis.part2.analysis.grammaticalAccuracy)}
      - Response Depth: ${JSON.stringify(detailedAnalysis.part2.analysis.responseDepth)}

      Part 3 Performance:
      - Fluency: ${JSON.stringify(detailedAnalysis.part3.analysis.fluencyCoherence)}
      - Vocabulary: ${JSON.stringify(detailedAnalysis.part3.analysis.lexicalResource)}
      - Topical Relevance: ${JSON.stringify(detaibledAnalysis.part3.analysis.topicalRelevance)}
      - Grammar: ${JSON.stringify(detailedAnalysis.part3.analysis.grammaticalAccuracy)}
      - Response Depth: ${JSON.stringify(detailedAnalysis.part3.analysis.responseDepth)}

      Estimated Band Score: ${overallPerformance.estimatedBand}

      Provide a detailed, constructive, and encouraging feedback that:
      1. Highlights specific strengths in speaking performance
      2. Identifies areas for improvement
      3. Offers practical tips for enhancing IELTS speaking skills
      4. Maintains an encouraging and supportive tone
    `;
  }

  _calculateOverallPerformance(detailedAnalysis) {
    const performanceScores = {};
    
    ['part1', 'part2', 'part3'].forEach(part => {
      const analysis = detailedAnalysis[part].analysis;
      
      performanceScores[part] = [
        analysis.fluencyCoherence.overallCoherenceScore,
        analysis.lexicalResource.averageUniqueness,
        analysis.grammaticalAccuracy.averageErrorCount === 0 ? 1 : 0,
        analysis.topicalRelevance.every(r => r.relevanceScore > 0) ? 1 : 0
      ].reduce((a, b) => a + b, 0) / 4;
    });

    const overallScore = Object.values(performanceScores).reduce((a, b) => a + b, 0) / 3;
    
    return {
      estimatedBand: this._convertScoreToBand(overallScore),
      partScores: performanceScores
    };
  }

  _convertScoreToBand(score) {
    if (score >= 0.8) return 7.5;
    if (score >= 0.6) return 6.5;
    if (score >= 0.4) return 5.5;
    return 4.5;
  }
}

export default AIFeedbackGenerator;

