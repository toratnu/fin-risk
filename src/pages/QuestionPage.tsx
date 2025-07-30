
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
} from '@mui/material';

// 質問と選択肢の型定義
interface Option {
  text: string;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  // JSONファイルから質問を読み込む
  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Failed to load questions:", err));
  }, []);

  // 回答を処理するハンドラ
  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const questionId = questions[currentQuestionIndex].id;
    const score = Number(event.target.value);
    setAnswers({ ...answers, [questionId]: score });
  };

  // 「次へ」ボタンの処理
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 最後の質問なら結果ページへ
      navigate('/result', { state: { answers, questions } });
    }
  };

  // 「前へ」ボタンの処理
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (questions.length === 0) {
    return <Container><Typography>質問を読み込んでいます...</Typography></Container>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Typography variant="h5" component="h1" gutterBottom>
        質問 {currentQuestionIndex + 1} / {questions.length}
      </Typography>
      <FormControl component="fieldset" fullWidth margin="normal">
        <FormLabel component="legend" sx={{ fontSize: '1.2rem', mb: 2 }}>{currentQuestion.text}</FormLabel>
        <RadioGroup
          aria-label={currentQuestion.text}
          name={currentQuestion.id}
          value={currentAnswer || ''}
          onChange={handleAnswerChange}
        >
          {currentQuestion.options.map((option) => (
            <FormControlLabel
              key={option.text}
              value={option.score}
              control={<Radio />}
              label={option.text}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          前へ
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={currentAnswer === undefined}
        >
          {currentQuestionIndex < questions.length - 1 ? '次へ' : '結果を見る'}
        </Button>
      </Box>
    </Container>
  );
};

export default QuestionPage;
