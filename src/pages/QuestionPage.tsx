
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  LinearProgress,
  Fade,
} from '@mui/material';

// 型定義
interface RadarScore {
  [key: string]: number;
}

interface Option {
  text: string;
  score: number;
  radarScore: RadarScore;
  nextQuestionId: string | null;
}

interface Question {
  text: string;
  options: Option[];
}

interface QuestionsData {
  initialQuestionId: string;
  questions: { [key: string]: Question };
}

// 回答の型
interface Answer {
  score: number;
  radarScore: RadarScore;
}

const QuestionPage: React.FC = () => {
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: Answer }>({});
  const [maxQuestions, setMaxQuestions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data: QuestionsData) => {
        setQuestionsData(data);
        setCurrentQuestionId(data.initialQuestionId);
        setHistory([data.initialQuestionId]);
        // 最大質問数を計算（おおよその進捗表示のため）
        setMaxQuestions(Object.keys(data.questions).length);
      })
      .catch((err) => console.error("Failed to load questions:", err));
  }, []);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentQuestionId || !questionsData) return;

    const question = questionsData.questions[currentQuestionId];
    const selectedOption = question.options.find(
      (opt) => opt.text === event.target.value
    );

    if (selectedOption) {
      setAnswers({
        ...answers,
        [currentQuestionId]: {
          score: selectedOption.score,
          radarScore: selectedOption.radarScore,
        },
      });
    }
  };

  const handleNext = () => {
    if (!currentQuestionId || !questionsData) return;

    const currentAnswer = answers[currentQuestionId];
    if (!currentAnswer) return;

    const currentQuestion = questionsData.questions[currentQuestionId];
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.score === currentAnswer.score
    );

    if (selectedOption) {
      const nextId = selectedOption.nextQuestionId;
      if (nextId) {
        setCurrentQuestionId(nextId);
        setHistory([...history, nextId]);
      } else {
        navigate('/result', { state: { answers } });
      }
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevQuestionId = newHistory[newHistory.length - 1];
      setCurrentQuestionId(prevQuestionId);
      setHistory(newHistory);
    }
  };

  if (!questionsData || !currentQuestionId) {
    return <Container><Typography>質問を読み込んでいます...</Typography></Container>;
  }

  const currentQuestion = questionsData.questions[currentQuestionId];
  const currentAnswerData = answers[currentQuestionId];
  const progress = maxQuestions > 0 ? (history.length / maxQuestions) * 100 : 0;

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
          質問 {history.length} / {maxQuestions}
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Fade in={true} timeout={500}>
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend" sx={{ fontSize: '1.3rem', mb: 2, fontWeight: 'bold' }}>
            {currentQuestion.text}
          </FormLabel>
          <RadioGroup
            aria-label={currentQuestion.text}
            name={currentQuestionId}
            value={currentQuestion.options.find(opt => opt.score === currentAnswerData?.score)?.text || ''}
            onChange={handleAnswerChange}
          >
            {currentQuestion.options.map((option) => (
              <FormControlLabel
                key={option.text}
                value={option.text} // valueをtextに変更してハンドラを修正
                control={<Radio />}
                label={option.text}
                sx={{ mb: 1, border: '1px solid #ddd', borderRadius: 2, p: 1, m: 0.5 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Fade>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={history.length <= 1}
        >
          前へ
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={currentAnswerData === undefined}
        >
          次へ
        </Button>
      </Box>
    </Container>
  );
};

export default QuestionPage;
