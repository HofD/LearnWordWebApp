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
      intro: 'A free AI-assisted vocabulary app for turning texts, notes, and word lists into study-ready cards.',
      description: 'Generate draft cards with AI, review translations and transcriptions before saving, organize words into topic collections, and practice them with spaced repetition.',
      highlights: [
        'Create vocabulary cards faster from your own texts',
        'Keep translations, transcriptions, and topic collections together',
        'Review cards with spaced repetition when they are due'
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
    aiCards: {
      title: 'Generate cards with AI',
      intro: 'Paste a short text and review draft cards before saving them.',
      sourceText: 'Source text',
      sourcePlaceholder: 'Paste a paragraph, notes, or a short word list.',
      sourceLanguage: 'Source language',
      targetLanguage: 'Target language',
      level: 'Level',
      maxCards: 'Max cards',
      generate: 'Generate Suggestions',
      generating: 'Generating...',
      suggestions: 'Suggestions',
      selected: 'selected',
      selectSuggestion: 'Select suggestion',
      saveSelected: 'Save Selected',
      saving: 'Saving...',
      generateError: 'Could not generate suggestions. Your collection is still loaded.',
      providerRateLimited: 'AI generation is temporarily rate limited. Please try again in a minute.',
      providerUnavailable: 'AI generation is temporarily unavailable. Please try again later.',
      saveError: 'Could not save selected suggestions. Please try again.',
      saveSuccess: 'Selected cards were saved.'
    },
    cards: {
      card: 'Card',
      word: 'word',
      words: 'words',
      deleteThisCard: 'Delete this card',
      deleteThisCardQuestion: 'Delete this card?',
      showing: 'Showing',
      of: 'of',
      perPage: 'Per page',
      pagination: 'Card pages',
      previous: 'Previous',
      next: 'Next',
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
      intro: 'Reveal each translation, then choose how the answer felt.',
      showTranslation: 'Show Translation',
      again: 'Again',
      hard: 'Hard',
      good: 'Good',
      easy: 'Easy',
      srsMeta: 'Spaced repetition details',
      interval: 'Interval',
      reviews: 'Reviews',
      due: 'Due',
      daysShort: 'd',
      emptyTitle: 'No Cards to Review',
      emptyIntro: 'There are no cards available for review in this collection.',
      backToCollections: 'Back to Collections'
    },
    about: {
      title: 'About Learn Word',
      intro: 'Learn Word is an AI-assisted vocabulary learning app for creating cards from real texts and reviewing them over time.',
      free: 'The app is free to use. Create an account, generate draft cards with AI, check translations and transcriptions, save your own collections, and return to review them at your pace.',
      note: 'It is made for everyday language practice: quick card creation, clear review flows, and spaced repetition without unnecessary setup.',
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
      intro: 'Бесплатное приложение с AI для изучения иностранных слов и создания карточек из текстов, заметок и списков слов.',
      description: 'Создавайте черновики карточек с AI, проверяйте переводы и транскрипции перед сохранением, собирайте слова в тематические коллекции и повторяйте их по интервальной системе.',
      highlights: [
        'Быстрее создавайте карточки из своих текстов',
        'Храните переводы, транскрипции и тематические коллекции вместе',
        'Повторяйте карточки по интервальной системе, когда они снова нужны'
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
    aiCards: {
      title: 'Создать карточки с AI',
      intro: 'Вставьте короткий текст и проверьте черновики перед сохранением.',
      sourceText: 'Исходный текст',
      sourcePlaceholder: 'Вставьте абзац, заметки или короткий список слов.',
      sourceLanguage: 'Исходный язык',
      targetLanguage: 'Язык перевода',
      level: 'Уровень',
      maxCards: 'Максимум карточек',
      generate: 'Создать варианты',
      generating: 'Создаем...',
      suggestions: 'Варианты',
      selected: 'выбрано',
      selectSuggestion: 'Выбрать вариант',
      saveSelected: 'Сохранить выбранные',
      saving: 'Сохраняем...',
      generateError: 'Не удалось создать варианты. Коллекция осталась загруженной.',
      providerRateLimited: 'AI-генерация временно ограничена провайдером. Попробуйте еще раз через минуту.',
      providerUnavailable: 'AI-генерация временно недоступна. Попробуйте позже.',
      saveError: 'Не удалось сохранить выбранные варианты. Попробуйте еще раз.',
      saveSuccess: 'Выбранные карточки сохранены.'
    },
    cards: {
      card: 'Карточка',
      word: 'слово',
      words: 'слов',
      deleteThisCard: 'Удалить эту карточку',
      deleteThisCardQuestion: 'Удалить эту карточку?',
      showing: 'Показано',
      of: 'из',
      perPage: 'На странице',
      pagination: 'Страницы карточек',
      previous: 'Назад',
      next: 'Вперед',
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
      intro: 'Откройте перевод и выберите, насколько легко было вспомнить.',
      showTranslation: 'Показать перевод',
      again: 'Снова',
      hard: 'Трудно',
      good: 'Хорошо',
      easy: 'Легко',
      srsMeta: 'Данные интервального повторения',
      interval: 'Интервал',
      reviews: 'Повторы',
      due: 'Срок',
      daysShort: 'дн.',
      emptyTitle: 'Нет карточек для повторения',
      emptyIntro: 'В этой коллекции нет карточек, доступных для повторения.',
      backToCollections: 'Назад к коллекциям'
    },
    about: {
      title: 'О Learn Word',
      intro: 'Learn Word — приложение с AI для изучения слов: создавайте карточки из реальных текстов и повторяйте их со временем.',
      free: 'Приложение бесплатное. Создайте аккаунт, генерируйте черновики карточек с AI, проверяйте переводы и транскрипции, сохраняйте коллекции и возвращайтесь к повторению в удобном темпе.',
      note: 'Оно сделано для повседневной языковой практики: быстрое создание карточек, понятное повторение и интервальная система без лишней настройки.',
      version: 'Версия'
    },
    errors: {
      wrongCredentials: 'Неверное имя пользователя или пароль.',
      generic: 'Что-то пошло не так. Попробуйте позже.'
    }
  }
} as const;
