
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Text,
} from 'recharts';

// --- 型定義 ---
interface RadarScore { [key: string]: number; }
interface Answer { score: number; radarScore: RadarScore; }
interface LocationState { answers: { [key: string]: Answer }; }

interface ResultType {
  name: string;
  description: string;
}

interface Portfolio {
  title: string;
  details: string;
}

// --- カスタム軸ラベルコンポーネント ---
const CustomizedAxisTick = (props: any) => {
  const { x, y, payload, textAnchor } = props;
  const { value } = payload;
  const style = { fontSize: '12px' };

  if (value === '金融リテラシー') {
    return (
      <g transform={`translate(${x},${y})`}>
        <Text textAnchor={textAnchor} y={0} dy={-4} style={style}>金融</Text>
        <Text textAnchor={textAnchor} y={0} dy={12} style={style}>リテラシー</Text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <Text textAnchor={textAnchor} style={style}>{value}</Text>
    </g>
  );
};

// --- 診断タイプの定義 ---
const resultTypes: { [key: string]: ResultType } = {
  ultraConservative: { name: '堅実守備タイプ', description: 'リスクを徹底的に回避し、資産を「守る」ことを最優先に考えるタイプです。' },
  conservative: { name: '安定バランスタイプ', description: '安定性を重視しつつ、インフレなどに負けないよう、コツコツと資産形成を目指すタイプです。' },
  moderate: { name: 'インデックス・コアタイプ', description: '市場全体の成長を、低コストで効率的に享受したいと考える、バランス感覚に優れたタイプです。' },
  aggressive: { name: 'サテライト成長タイプ', description: 'コアとなる安定資産を確保しつつ、サテライト部分で積極的にリターンを狙うタイプです。' },
  veryAggressive: { name: 'ハイリスク追求タイプ', description: '短期的な大きな価格変動も許容し、高いリターンを積極的に追求するチャレンジャーです。' },
};

// --- 診断ロジック ---
const getDiagnosis = (radarScores: { [key: string]: number }) => {
  const { 積極性 = 0, 安定性 = 0, 収益性 = 0, 金融リテラシー = 0, 合理性 = 0 } = radarScores;

  let finalType: keyof typeof resultTypes = 'ultraConservative';

  // 1. 基本タイプ判定
  if (積極性 >= 10 && 収益性 >= 8) {
    finalType = 'veryAggressive';
  } else if (積極性 >= 7 && 収益性 >= 5) {
    finalType = 'aggressive';
  } else if (安定性 >= 7) {
    finalType = 'conservative';
  } else if (安定性 >= 10) {
    finalType = 'ultraConservative';
  } else {
    finalType = 'moderate';
  }

  // 2. リテラシーと合理性による調整
  if (finalType === 'veryAggressive' && (金融リテラシー < 4 || 合理性 < 4)) {
    finalType = 'aggressive'; // リテラシー/合理性が低い場合、1段階引き下げ
  }
  if (finalType === 'aggressive' && (金融リテラシー < 3 || 合理性 < 3)) {
    finalType = 'moderate'; // 同様に引き下げ
  }

  // 3. ポートフォリオ提案
  let portfolio: Portfolio;
  const isLiterate = 金融リテラシー >= 4 && 合理性 >= 4;

  switch (finalType) {
    case 'ultraConservative':
      portfolio = { title: '守りのポートフォリオ', details: '個人向け国債や定期預金が中心。資産を「減らさない」ことを最優先します。' };
      break;
    case 'conservative':
      portfolio = { title: '安定重視ポートフォリオ', details: '先進国債券ファンド70%、全世界株式インデックスファンド30%。インフレ対策を意識した構成です。' };
      break;
    case 'moderate':
      portfolio = { title: 'バランス型ポートフォリオ', details: '全世界株式インデックスファンド60%、先進国債券ファンド40%。市場の平均リターンを目指します。' };
      break;
    case 'aggressive':
      portfolio = { title: '成長期待ポートフォリオ', details: '全世界株式インデックスファンド80%、新興国株式や個別グロース株20%。リスクを取り、高い成長を狙います。' };
      break;
    case 'veryAggressive':
      if (isLiterate) {
        portfolio = { title: '超積極的ポートフォリオ', details: '個別グロース株、テーマ型ETF、暗号資産なども視野に。高い専門知識とリスク許容度が求められます。' };
      } else {
        portfolio = { title: '成長期待ポートフォリオ（推奨調整版）', details: '高いリターンを求める意欲はありますが、まずは全世界株式インデックスファンド80%、新興国株式20%など、分散の効いた商品から始めることを強く推奨します。' };
      }
      break;
    default:
      portfolio = { title: '標準ポートフォリオ', details: '全世界株式インデックスファンド50%、先進国債券ファンド50%。' };
  }

  return { resultType: resultTypes[finalType], portfolio };
};

const ResultPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state || !state.answers || Object.keys(state.answers).length === 0) {
    return (
      <Container maxWidth="md" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>診断データがありません。</Alert>
        <Button component={Link} to="/" variant="contained">トップへ戻る</Button>
      </Container>
    );
  }

  // レーダーチャート用データを集計
  const radarScores: { [key: string]: number } = {};
  Object.values(state.answers).forEach(ans => {
    Object.entries(ans.radarScore).forEach(([key, value]) => {
      if (!radarScores[key]) radarScores[key] = 0;
      radarScores[key] += value;
    });
  });

  const radarDataForChart = Object.keys(radarScores).map(key => ({
    subject: key,
    value: radarScores[key],
    fullMark: 15, // 満点を固定値に（要調整）
  }));

  const { resultType, portfolio } = getDiagnosis(radarScores);

  return (
    <Container maxWidth="xl" style={{ marginTop: '2rem' }}>
      <Fade in={true} timeout={800}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            診断結果
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 4 }}>
              <Card sx={{ backgroundColor: 'primary.main', color: 'white', borderRadius: 3, mb: 3, maxWidth: 'md', mx: 'auto' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" align="center">あなたの投資スタイルは...</Typography>
                  <Typography variant="h4" component="p" align="center" sx={{ fontWeight: 'bold', my: 1 }}>
                    「{resultType.name}」
                  </Typography>
                </CardContent>
              </Card>
              <Box sx={{ textAlign: 'left', maxWidth: 'md', mx: 'auto' }}>
                <Typography variant="h6" gutterBottom><strong>特徴</strong></Typography>
                <Typography variant="body1" paragraph>{resultType.description}</Typography>
                <Typography variant="h6" gutterBottom><strong>推奨ポートフォリオ：{portfolio.title}</strong></Typography>
                <Typography variant="body1" paragraph>{portfolio.details}</Typography>
              </Box>
            </Box>

            <Box sx={{ height: 400, width: '100%' }}>
              <Typography variant="h6" align="center" gutterBottom><strong>あなたの投資傾向</strong></Typography>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarDataForChart}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={<CustomizedAxisTick />} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                  <Radar name="あなたのスコア" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} to="/" variant="contained" size="large">もう一度診断する</Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default ResultPage;
