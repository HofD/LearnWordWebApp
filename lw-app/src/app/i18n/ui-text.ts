export type UiLanguage = 'en' | 'ru';

export const uiLanguages: Array<{ code: UiLanguage; label: string; shortLabel: string }> = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' }
];

export const defaultLanguage: UiLanguage = 'en';

export const uiText = {
  en: {
    common: {
      brand: 'Learn Word',
      loading: 'Loading...',
      close: 'Close',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      required: 'required',
      optional: 'optional',
      emailPlaceholder: 'name@example.com',
      language: 'Language'
    },
    header: {
      home: 'Home',
      about: 'About',
      logout: 'Log Out',
      toggleNavigation: 'Toggle navigation',
      selectLanguage: 'Select language'
    },
    footer: {
      rights: 'All rights reserved.'
    },
    home: {
      title: 'Learn Word',
      intro: 'A free vocabulary notebook for learning foreign words without spreadsheets or scattered notes.',
      description: 'Create collections for topics you care about, add words with translations and transcriptions, and review them as cards when you are ready to practice.',
      highlights: [
        'Keep words organized by topic',
        'Store translation and pronunciation hints in one place',
        'Review cards to remember words with less effort'
      ],
      login: 'Log In',
      register: 'Register'
    },
    login: {
      title: 'Log In',
      intro: 'Continue to your collections and review queue.',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      submit: 'Login',
      register: 'Register'
    },
    register: {
      title: 'Register',
      intro: 'Create an account to save collections and review progress.',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      passwordHelp: 'Password length must be 6 or more symbols and must have at least one non-alphanumeric character and one digit.',
      submit: 'Register',
      login: 'Log In',
      success: 'Registration successful, please check your email for verification instructions'
    },
    password: {
      resetTitle: 'Reset Password',
      resetIntro: 'Enter your email and we will send reset instructions if the account exists.',
      instructionsSent: 'If an account exists for this email, password reset instructions were sent.',
      email: 'Email Address',
      emailRequired: 'Email is required',
      emailInvalid: 'Email must be a valid email address',
      sendInstructions: 'Send Instructions',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      newTitle: 'New Password',
      newIntro: 'Choose a new password for your LearnWord account.',
      password: 'Password',
      confirmPassword: 'Confirm password',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      confirmRequired: 'Confirm password is required',
      passwordsMustMatch: 'Passwords must match',
      resetting: 'Resetting...',
      resetSubmit: 'Reset Password',
      resetSuccess: 'Password reset successful, you can now login'
    },
    emailConfirm: {
      title: 'Verify Email',
      verifying: 'Verifying...',
      failedPrefix: 'Verification failed, you can also verify your account using the',
      forgotPasswordLink: 'forgot password',
      failedSuffix: 'page.',
      success: 'Verification successful, you can now login'
    },
    collections: {
      title: 'Collections',
      intro: 'Organize words into small groups, then review them when you are ready.',
      cardsCount: 'Cards in this collection:',
      open: 'Open',
      review: 'Review',
      deleteCollection: 'Delete',
      deleteTitle: 'Delete',
      deleteQuestionMark: '?',
      newName: 'New collection name',
      namePlaceholder: 'For example, Travel',
      create: 'Create Collection',
      emptyTitle: 'No collections yet',
      emptyIntro: 'Create your first collection above and start adding words.'
    },
    collection: {
      intro: 'Add words to this collection or edit the existing cards.'
    },
    cards: {
      card: 'Card',
      word: 'word',
      words: 'words',
      deleteThisCard: 'Delete this card',
      deleteThisCardQuestion: 'Delete this card?',
      addTitle: 'Add a new card',
      addIntro: 'Start with the first word, then add more words to the card when needed.'
    },
    words: {
      actions: 'Word actions',
      editWord: 'Edit word',
      deleteWord: 'Delete word',
      text: 'Text',
      translation: 'Translation',
      transcription: 'Transcription',
      textRequired: 'Text is required.',
      translationRequired: 'Translation is required.',
      deleteQuestion: 'Delete this word?',
      deleteBody: 'This removes only this word.',
      lastWordWarning: 'This is the last word, so the card will be removed too.',
      addMore: 'Add More',
      addWord: 'Add Word',
      valuePlaceholder: 'Moon',
      translationPlaceholder: 'Луна',
      transcriptionPlaceholder: '[muːn]',
      add: 'Add',
      addHint: 'Fill in text and translation to add the word.'
    },
    review: {
      title: 'Review',
      intro: 'Move through the cards one by one and mark what needs more practice.',
      showTranslation: 'Show Translation',
      forget: 'Forget',
      learn: 'Learn',
      emptyTitle: 'No Cards to Review',
      emptyIntro: 'There are no cards available for review in this collection.',
      backToCollections: 'Back to Collections'
    },
    about: {
      title: 'About Learn Word',
      intro: 'Learn Word is a simple app for collecting foreign words and repeating them with cards.',
      free: 'The app is free to use. Create an account, save your own collections, add translations and transcriptions, and come back to review them at your pace.',
      note: 'It is made for everyday vocabulary practice: small lists, clear cards, and no unnecessary setup.',
      version: 'Version'
    },
    errors: {
      wrongCredentials: 'Wrong username or password.',
      generic: 'Something bad happened; please try again later.'
    }
  },
  ru: {
    common: {
      brand: 'Learn Word',
      loading: 'Загрузка...',
      close: 'Закрыть',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      required: 'обязательно',
      optional: 'необязательно',
      emailPlaceholder: 'name@example.com',
      language: 'Язык'
    },
    header: {
      home: 'Главная',
      about: 'О проекте',
      logout: 'Выйти',
      toggleNavigation: 'Открыть навигацию',
      selectLanguage: 'Выберите язык'
    },
    footer: {
      rights: 'Все права защищены.'
    },
    home: {
      title: 'Learn Word',
      intro: 'Бесплатный словарь для изучения иностранных слов без таблиц и разрозненных заметок.',
      description: 'Создавайте коллекции по нужным темам, добавляйте слова с переводами и транскрипциями, а затем повторяйте их как карточки, когда готовы практиковаться.',
      highlights: [
        'Храните слова по темам',
        'Держите перевод и подсказку по произношению рядом',
        'Повторяйте карточки, чтобы легче запоминать слова'
      ],
      login: 'Войти',
      register: 'Регистрация'
    },
    login: {
      title: 'Вход',
      intro: 'Продолжите работу с коллекциями и очередью повторения.',
      email: 'Email',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      submit: 'Войти',
      register: 'Регистрация'
    },
    register: {
      title: 'Регистрация',
      intro: 'Создайте аккаунт, чтобы сохранять коллекции и прогресс повторения.',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      passwordHelp: 'Пароль должен быть не короче 6 символов и содержать хотя бы один не буквенно-цифровой символ и одну цифру.',
      submit: 'Зарегистрироваться',
      login: 'Войти',
      success: 'Регистрация успешна, проверьте email для подтверждения аккаунта'
    },
    password: {
      resetTitle: 'Сброс пароля',
      resetIntro: 'Введите email, и мы отправим инструкции по сбросу, если аккаунт существует.',
      instructionsSent: 'Если для этого email есть аккаунт, инструкции по сбросу пароля отправлены.',
      email: 'Email',
      emailRequired: 'Email обязателен',
      emailInvalid: 'Введите корректный email',
      sendInstructions: 'Отправить инструкции',
      sending: 'Отправка...',
      backToLogin: 'Назад ко входу',
      newTitle: 'Новый пароль',
      newIntro: 'Выберите новый пароль для аккаунта LearnWord.',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      passwordRequired: 'Пароль обязателен',
      passwordMinLength: 'Пароль должен быть не короче 6 символов',
      confirmRequired: 'Подтверждение пароля обязательно',
      passwordsMustMatch: 'Пароли должны совпадать',
      resetting: 'Сброс...',
      resetSubmit: 'Сбросить пароль',
      resetSuccess: 'Пароль сброшен, теперь вы можете войти'
    },
    emailConfirm: {
      title: 'Подтверждение email',
      verifying: 'Проверяем...',
      failedPrefix: 'Не удалось подтвердить email. Также можно подтвердить аккаунт через страницу',
      forgotPasswordLink: 'сброса пароля',
      failedSuffix: '.',
      success: 'Email подтвержден, теперь вы можете войти'
    },
    collections: {
      title: 'Коллекции',
      intro: 'Разделяйте слова на небольшие группы и повторяйте их, когда будете готовы.',
      cardsCount: 'Карточек в коллекции:',
      open: 'Открыть',
      review: 'Повторять',
      deleteCollection: 'Удалить',
      deleteTitle: 'Удалить',
      deleteQuestionMark: '?',
      newName: 'Название новой коллекции',
      namePlaceholder: 'Например, Путешествие',
      create: 'Создать коллекцию',
      emptyTitle: 'Коллекций пока нет',
      emptyIntro: 'Создайте первую коллекцию выше и начните добавлять слова.'
    },
    collection: {
      intro: 'Добавляйте слова в коллекцию или редактируйте существующие карточки.'
    },
    cards: {
      card: 'Карточка',
      word: 'слово',
      words: 'слов',
      deleteThisCard: 'Удалить эту карточку',
      deleteThisCardQuestion: 'Удалить эту карточку?',
      addTitle: 'Добавить новую карточку',
      addIntro: 'Начните с первого слова, а затем добавьте в карточку другие слова при необходимости.'
    },
    words: {
      actions: 'Действия со словом',
      editWord: 'Редактировать слово',
      deleteWord: 'Удалить слово',
      text: 'Текст',
      translation: 'Перевод',
      transcription: 'Транскрипция',
      textRequired: 'Текст обязателен.',
      translationRequired: 'Перевод обязателен.',
      deleteQuestion: 'Удалить это слово?',
      deleteBody: 'Будет удалено только это слово.',
      lastWordWarning: 'Это последнее слово, поэтому карточка тоже будет удалена.',
      addMore: 'Добавить еще',
      addWord: 'Добавить слово',
      valuePlaceholder: 'Moon',
      translationPlaceholder: 'Луна',
      transcriptionPlaceholder: '[muːn]',
      add: 'Добавить',
      addHint: 'Заполните текст и перевод, чтобы добавить слово.'
    },
    review: {
      title: 'Повторение',
      intro: 'Просматривайте карточки по одной и отмечайте, что требует практики.',
      showTranslation: 'Показать перевод',
      forget: 'Не запомнил',
      learn: 'Запомнил',
      emptyTitle: 'Нет карточек для повторения',
      emptyIntro: 'В этой коллекции нет карточек, доступных для повторения.',
      backToCollections: 'Назад к коллекциям'
    },
    about: {
      title: 'О Learn Word',
      intro: 'Learn Word — простое приложение для сбора иностранных слов и повторения их с помощью карточек.',
      free: 'Приложение бесплатное. Создайте аккаунт, сохраняйте свои коллекции, добавляйте переводы и транскрипции и возвращайтесь к повторению в удобном темпе.',
      note: 'Оно сделано для повседневной словарной практики: короткие списки, понятные карточки и ничего лишнего.',
      version: 'Версия'
    },
    errors: {
      wrongCredentials: 'Неверное имя пользователя или пароль.',
      generic: 'Что-то пошло не так. Попробуйте позже.'
    }
  }
} as const;
