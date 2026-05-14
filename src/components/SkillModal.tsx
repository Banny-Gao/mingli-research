import React from 'react';
import { skillContent } from '../data/ditiansui-site';

interface Props {
  slug: string;
  skill: string;
}

const SkillModal: React.FC<Props> = ({ skill }) => {
  const content = skillContent[skill];

  if (!content) {
    return (
      <div className="text-center py-16" style={{ color: '#8080a0' }}>
        未找到该技能内容
      </div>
    );
  }

  return (
    <div
      className="prose-skill"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default SkillModal;