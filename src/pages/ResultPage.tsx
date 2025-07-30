
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Alert,
} from '@mui/material';

// 質問と回答の型定義（QuestionPageと共通）
interface AnswerState {
  answers: { [key: string]: number };
}

// 診断結果の型定義
interface ResultType {
  name: string;
  description: string;
  advice: string;
}

// スコアに基づいて診断結果を決定する
const getResultType = (totalScore: number): ResultType => {
  if (totalScore <= 5) {
    return {
      name: '保守的タイプ',
      description: '安定性を最優先し、リスクを極力避けたいと考えるタイプです。元本割れのリスクに対して非常に慎重です。',
      advice: '個人向け国債や預貯金、安定性の高い債券ファンドなどが中心のポートフォリオが考えられます。',
    };
  } else if (totalScore <= 10) {
    return {
      name: '安定成長タイプ',
      description: '安定性を重視しつつも、ある程度のリターンを期待するバランスの取れたタイプです。市場の変動にはやや敏感です。',
      advice: '先進国の株式や債券に分散投資するバランスファンドなどが選択肢になります。',
    };
  } else {
    return {
      name: '積極的タイプ',
      description: '高いリターンを目指すため、相応のリスクを取ることを厭わないタイプです。市場の大きな変動にも比較的寛容です。',
      advice: '国内外の株式を中心に、成長が期待される分野への投資も視野に入れたポートフォリオが考えられます。',
    };
  }
};

const ResultPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as AnswerState | null;

  if (!state || !state.answers) {
    return (
      <Container maxWidth="md" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          診断データがありません。トップページから診断をやり直してください。
        </Alert>
        <Button component={Link} to="/" variant="contained">
          トップへ戻る
        </Button>
      </Container>
    );
  }

  const totalScore = Object.values(state.answers).reduce((sum, score) => sum + score, 0);
  const result = getResultType(totalScore);

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          診断結果
        </Typography>
        <Typography variant="h5" component="h2" color="primary" sx={{ mb: 2 }}>
          あなたは「{result.name}」です
        </Typography>
        <Box sx={{ textAlign: 'left', my: 4 }}>
          <Typography variant="body1" paragraph>
            <strong>特徴:</strong> {result.description}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>推奨される投資スタイル:</strong> {result.advice}
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="contained" size="large">
          もう一度診断する
        </Button>
      </Paper>
    </Container>
  );
};

export default ResultPage;
