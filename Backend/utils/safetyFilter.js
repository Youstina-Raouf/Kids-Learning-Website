const Filter = require('bad-words');
const natural = require('natural');

const filter = new Filter();
const tokenizer = new natural.WordTokenizer();

// Extended list of inappropriate words/phrases (Arabic and English)
const inappropriatePatterns = [
  /bad\s+word/i,
  /curse/i,
  /swear/i,
  // Add more patterns as needed
];

// Cyberbullying indicators
const bullyingPatterns = [
  /you\s+are\s+stupid/i,
  /you\s+are\s+dumb/i,
  /hate\s+you/i,
  /kill\s+yourself/i,
  /nobody\s+likes\s+you/i,
  // Add Arabic patterns
  /أنت\s+غبي/i,
  /أكرهك/i,
];

function detectInappropriateContent(text) {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, reason: null };
  }

  const lowerText = text.toLowerCase();

  // Check bad words
  if (filter.isProfane(lowerText)) {
    return {
      isSafe: false,
      reason: 'inappropriate_content',
      severity: 'medium',
      message: 'This message contains inappropriate language. Please use kind words!',
      messageAr: 'هذه الرسالة تحتوي على لغة غير لائقة. يرجى استخدام كلمات لطيفة!'
    };
  }

  // Check bullying patterns
  for (const pattern of bullyingPatterns) {
    if (pattern.test(lowerText)) {
      return {
        isSafe: false,
        reason: 'cyberbullying',
        severity: 'high',
        message: 'This message may hurt others. Let\'s be kind and respectful!',
        messageAr: 'قد تؤذي هذه الرسالة الآخرين. دعنا نكون لطفاء ومحترمين!'
      };
  }
  }

  // Check inappropriate patterns
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(lowerText)) {
      return {
        isSafe: false,
        reason: 'inappropriate_content',
        severity: 'low',
        message: 'Please use appropriate language.',
        messageAr: 'يرجى استخدام لغة مناسبة.'
      };
    }
  }

  return { isSafe: true, reason: null };
}

function generateGuidanceText(reason, locale = 'en') {
  const guidance = {
    cyberbullying: {
      en: 'Remember: Words can hurt. Always treat others with kindness and respect, just like you want to be treated!',
      ar: 'تذكر: الكلمات يمكن أن تؤذي. عامل الآخرين دائمًا بلطف واحترام، تمامًا كما تريد أن تُعامل!'
    },
    inappropriate_content: {
      en: 'Let\'s keep our conversations friendly and positive! Use words that make others feel good.',
      ar: 'دعنا نحافظ على محادثاتنا ودية وإيجابية! استخدم كلمات تجعل الآخرين يشعرون بالرضا.'
    }
  };

  return guidance[reason]?.[locale] || guidance[reason]?.en || '';
}

module.exports = {
  detectInappropriateContent,
  generateGuidanceText
};

