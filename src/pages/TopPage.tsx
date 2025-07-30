
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

const TopPage: React.FC = () => {
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        あなたの投資スタイルを見つけよう
      </Typography>
      <Typography variant="body1" paragraph>
        いくつかの簡単な質問に答えるだけで、あなたのリスク許容度を診断し、最適な投資スタイルを提案します。
      </Typography>
      <Button component={Link} to="/questions" variant="contained" color="primary" size="large">
        診断を始める
      </Button>
    </Container>
  );
};

export default TopPage;
