const getZodiacSign = (birthdate) => {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'aquarius';
  } else {
    return 'pisces';
  }
};

const getZodiacSignInfo = (sign) => {
  const zodiacInfo = {
    aries: { element: 'Fire', planet: 'Mars', symbol: '♈', dates: 'March 21 - April 19' },
    taurus: { element: 'Earth', planet: 'Venus', symbol: '♉', dates: 'April 20 - May 20' },
    gemini: { element: 'Air', planet: 'Mercury', symbol: '♊', dates: 'May 21 - June 20' },
    cancer: { element: 'Water', planet: 'Moon', symbol: '♋', dates: 'June 21 - July 22' },
    leo: { element: 'Fire', planet: 'Sun', symbol: '♌', dates: 'July 23 - August 22' },
    virgo: { element: 'Earth', planet: 'Mercury', symbol: '♍', dates: 'August 23 - September 22' },
    libra: { element: 'Air', planet: 'Venus', symbol: '♎', dates: 'September 23 - October 22' },
    scorpio: { element: 'Water', planet: 'Pluto', symbol: '♏', dates: 'October 23 - November 21' },
    sagittarius: { element: 'Fire', planet: 'Jupiter', symbol: '♐', dates: 'November 22 - December 21' },
    capricorn: { element: 'Earth', planet: 'Saturn', symbol: '♑', dates: 'December 22 - January 19' },
    aquarius: { element: 'Air', planet: 'Uranus', symbol: '♒', dates: 'January 20 - February 18' },
    pisces: { element: 'Water', planet: 'Neptune', symbol: '♓', dates: 'February 19 - March 20' }
  };
  
  return zodiacInfo[sign] || null;
};

module.exports = {
  getZodiacSign,
  getZodiacSignInfo
};
