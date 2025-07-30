
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

// 型定義
interface Option {
  text: string;
  score: number;
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

const QuestionPage: React.FC = () => {
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]); // 質問IDの履歴
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  // JSONファイルから質問を読み込む
  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data: QuestionsData) => {
        setQuestionsData(data);
        setCurrentQuestionId(data.initialQuestionId);
        setHistory([data.initialQuestionId]);
      })
      .catch((err) => console.error("Failed to load questions:", err));
  }, []);

  // 回答を処理するハンドラ
  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentQuestionId || !questionsData) return;

    const score = Number(event.target.value);
    setAnswers({ ...answers, [currentQuestionId]: score });
  };

  // 「次へ」ボタンの処理
  const handleNext = () => {
    if (!currentQuestionId || !questionsData) return;

    const currentAnswerScore = answers[currentQuestionId];
    if (currentAnswerScore === undefined) return;

    const currentQuestion = questionsData.questions[currentQuestionId];
    const selectedOption = currentQuestion.options.find(opt => opt.score === currentAnswerScore);

    if (selectedOption) {
      const nextId = selectedOption.nextQuestionId;
      if (nextId) {
        setCurrentQuestionId(nextId);
        setHistory([...history, nextId]);
      } else {
        // 診断終了
        navigate('/result', { state: { answers } });
      }
    }
  };

  // 「前へ」ボタンの処理
  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // 現在の質問を履歴から削除
      const prevQuestionId = newHistory[newHistory.length - 1];
      
      setCurrentQuestionId(prevQuestionId);
      setHistory(newHistory);
    }
  };

  if (!questionsData || !currentQuestionId) {
    return <Container><Typography>質問を読み込んでいます...</Typography></Container>;
  }

  const currentQuestion = questionsData.questions[currentQuestionId];
  const currentAnswer = answers[currentQuestionId];
  const progress = (history.length / Object.keys(questionsData.questions).length) * 100; // おおよその進捗

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Box sx={{ width: '100%', mb: 2 }}>
        {/* プログレスバーは全体の質問数に対するおおよその進捗を示す */}
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Typography variant="h5" component="h1" gutterBottom>
        質問 {history.length}
      </Typography>
      <FormControl component="fieldset" fullWidth margin="normal">
        <FormLabel component="legend" sx={{ fontSize: '1.2rem', mb: 2 }}>{currentQuestion.text}</FormLabel>
        <RadioGroup
          aria-label={currentQuestion.text}
          name={currentQuestionId}
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
          disabled={history.length <= 1}
        >
          前へ
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={currentAnswer === undefined}
        >
          次へ
        </Button>
      </Box>
    </Container>
  );
};

export default QuestionPage;
