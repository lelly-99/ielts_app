import IELTSTest from "../../logic/test_logic.js";
import AIFeedbackGenerator from "../service/test.js";

export default function testRoute() {
  const testInstance = new IELTSTest();
  const feedbackGenerator = new AIFeedbackGenerator();

  function test(req, res) {
    try {
      testInstance.reset();

      res.render('test', {
        title: 'IELTS Speaking Test',
        currentPage: 'test',
        initialQuestion: testInstance.currentQuestion,
        currentPart: testInstance.currentPart
      });
    } catch (error) {
      console.error('Test Page Error:', error);
      res.status(500).send('Error starting test');
    }
  }



  async function submitAnswer(req, res) {
    try {
      const { answer } = req.body;
      const result = testInstance.processAnswer(answer);

      if (result.completed) {
        try {
          const feedback = await feedbackGenerator.generateFeedback(result.answers);
          result.feedback = feedback;
        } catch (error) {
          console.error('Feedback Generation Error:', error);
          result.feedback = { error: 'Failed to generate detailed feedback' };
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Answer Submission Error:', error);
      res.status(500).json({ error: 'Error processing answer' });
    }
  }

  return {
    test,
    submitAnswer
  };
}

