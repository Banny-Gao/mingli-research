import React from 'react';
import { interpContent } from '../data/di-tian-sui';

interface Props {
  slug: string;
  chapter: string;
}

const InterpModal: React.FC<Props> = ({ chapter }) => {
  const content = interpContent[chapter];

  if (!content) {
    return (
      <div className="text-center py-16" style={{ color: '#8080a0' }}>
        未找到该篇解读内容
      </div>
    );
  }

  return (
    <div
      className="prose-interp"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default InterpModal;