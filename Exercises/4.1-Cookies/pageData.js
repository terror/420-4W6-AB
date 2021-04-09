const pageData = {
  home: {
    heading: { en: 'Home', fr: 'Maison' },
    content: { en: 'Home is here.', fr: 'Maison ici.' },
    image:
      'https://www.rocketmortgage.com/resources-cmsassets/RocketMortgage.com/Article_Images/Large_Images/TypesOfHomes/types-of-homes-hero.jpg',
  },

  about: {
    heading: { en: 'About', fr: 'about lol french' },
    content: { en: 'About me.', fr: 'A propos de moi' },
    image:
      'data:image/png;base64,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',
  },
  contact: {
    heading: { en: 'Contact', fr: 'contact fr' },
    content: { en: 'contact', fr: 'contact fr' },
    image:
      'data:image/png;base64,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',
  },

  image: {
    heading: 'Image',
    content: { en: 'image', fr: 'image fr' },
    image:
      'data:image/png;base64,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',
  },
  items: {
    heading: { en: 'Items!', fr: 'items lol fr' },
    stock: [
      { name: 'Item 1', price: 20, onSale: true },
      { name: 'Item 2', price: 30, onSale: false },
      { name: 'Item 3', price: 40, onSale: true },
    ],
  },
};

module.exports = pageData;