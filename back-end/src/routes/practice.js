import logic from '../../logic/practice_logic.js'
import AIEvaluationService from '../service/practice.js'

export default function practice_route() {
    const logic_instance = logic()

    async function practice(req, res) {
      try {
        const random_question = logic_instance.get_random_question()

        res.render('practice', {
            title: 'Practice Mode',
            currentPage: 'practice',
            question: random_question,
            initialQuestion: random_question.question
        });
      } catch (error) {
        console.error('Dashboard Page Error:', error);
        res.status(500).render('error', {
            message: 'Failed to load practice page'
        });
      }
    }

    async function submit(req, res) {
      try {
        const { question, response } = req.body;

        // Validate input
        if (!question || !response) {
          return res.status(400).json({
            status: 'error',
            message: 'Question and response are required'
          });
        }

        // Evaluate the response
        const evaluation = await AIEvaluationService.evaluateResponse(question, response);

        if (evaluation.status === 'error') {
          const fallbackQuestion = logic_instance.get_random_question();
          evaluation.nextQuestion = fallbackQuestion.question;
        }

        // If no next question is generated, create one
        if (!evaluation.nextQuestion) {
          const nextQuestion = logic_instance.get_random_question();
          evaluation.nextQuestion = nextQuestion.question;
        }

        res.json(evaluation);
      } catch (error) {
        console.error('Answer Submission Error:', error);
        
        const fallbackQuestion = logic_instance.get_random_question();
        
        res.status(500).json({ 
          status: 'error', 
          message: 'Failed to process answer',
          nextQuestion: fallbackQuestion.question
        });
      }
    }
  
    return {
      practice,
      submit,
    };
}
